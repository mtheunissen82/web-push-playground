import fastify from "fastify";
import fastifyStatic from "@fastify/static";
import wp from "web-push";
import config from "./config.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Configure web-push with VAPID keys
wp.setVapidDetails(
  "mailto:marc@test.nl",
  config.VAPID_PUBLIC_KEY,
  config.VAPID_PRIVATE_KEY,
);

// An in-memory store for incoming push subscriptions
const pushSubscriptionStore = {};

const server = fastify();

function hasMatchingSegmentationTags(arr1, arr2) {
  return arr1.some((item) => arr2.includes(item));
}

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

  const notifications = [];
  const notification = { message };

  pushSubscriptions.forEach((subscriptionWrapper) => {
    notifications.push(
      wp.sendNotification(
        subscriptionWrapper.subscription,
        JSON.stringify(notification),
      ),
    );
  });

  const sendResults = await Promise.all(notifications);

  response.code(200).send(sendResults);
});

try {
  await server.listen({ host: config.SERVER_HOST, port: config.SERVER_PORT });
  console.log("Welcome to the web push playground 🚀");
  console.log(
    `Visit http://${config.SERVER_HOST}:${config.SERVER_PORT} to get started 🏎️`,
  );
} catch (e) {
  console.error("An error occurred when starting server ❌");
}
