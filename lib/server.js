import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fastify from "fastify";
import fastifyStatic from "@fastify/static";
import wp from "web-push";
import config from "./config.js";
import { hasMatchingSegmentationTags } from './util.js';

// Configure web-push with VAPID keys
wp.setVapidDetails(
  config.vapidSubject,
  config.vapidPublicKey,
  config.vapidPrivateKey,
);

// An in-memory store for incoming push subscriptions
const pushSubscriptionStore = {};

const server = fastify();

// Setup static server for serving client files
server.register(fastifyStatic, {
  root: join(dirname(fileURLToPath(import.meta.url)), "../public"),
});

server.post("/push-subscription", (request, response) => {
  console.info(
    `[push-subscription] POST: push subscription payload: '${JSON.stringify(
      request.body,
    )}'`,
  );
  pushSubscriptionStore[request.body?.subscription?.endpoint] = request.body;

  response.code(201).send();
});

server.get("/push-subscription", (_, response) => {
  console.info(`[push-subscription] GET: retrieve push subscriptions`);
  response.send(pushSubscriptionStore);
});

server.put("/push-message", async (request, response) => {
  const { message, targetSegmentationTags = [] } = request.body;

  if (!message) {
    response.code(400).send();
    return;
  }

  let pushSubscriptions = Object.values(pushSubscriptionStore);

  // filter subscriptions by segmentation tags
  if (targetSegmentationTags.length) {
    pushSubscriptions = pushSubscriptions.filter((subscriptionWrapper) =>
      hasMatchingSegmentationTags(
        subscriptionWrapper.segmentationTags,
        targetSegmentationTags,
      ),
    );
  }

  console.info(
    `[push-message] PUT: sending push message '${message}', target segmentation tags '${JSON.stringify(
      targetSegmentationTags,
    )}' to '${pushSubscriptions.length}' client(s)`,
  );

  const notification = { message };

  const sendResults = await Promise.all(
    pushSubscriptions.map((subscriptionWrapper) =>
      wp.sendNotification(
        subscriptionWrapper.subscription,
        JSON.stringify(notification),
      ),
    ),
  );

  response.code(200).send(sendResults);
});

try {
  await server.listen({ host: config.serverHost, port: config.serverPort });

  console.log("Welcome to the web push playground 🚀");
  console.log(
    `Visit http://${config.serverHost}:${config.serverPort} to get started 🏎️`,
  );
} catch (e) {
  console.error("An error occurred when starting server ❌");
}
