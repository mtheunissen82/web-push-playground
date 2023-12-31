const vapidPublicKey =
  "BM2MR35yHMyenBJ55vcy1U8gTtz6wT44WPdXdXclWdd2-jpLMNyUWPQ3ufUZodtPBCWF8VVvcOc1uEDaOtQB66Q";

// register the service worker
const registerServiceWorker = async () => {
  if ("serviceWorker" in navigator) {
    try {
      console.log("Registering service worker");

      const registration = await navigator.serviceWorker.register("/sw.js");

      if (registration.installing) {
        console.log("Service worker is 'installing'");
      } else if (registration.waiting) {
        console.log("Service worker is 'installed'");
      } else if (registration.active) {
        console.log("Service worker is 'active'");
      }
    } catch (error) {
      console.error(`Registration failed with ${error}`);
    }
  }
};

registerServiceWorker();

// Listen for incoming messages from service worker
navigator.serviceWorker.addEventListener("message", (event) => {
  console.log(
    `A message came in to the main thread from the service worker with data '${JSON.stringify(
      event.data,
    )}'`,
  );

  printMessageInNotificationBar(event.data?.message);
});

const subscribePushManagerButton = document.getElementById(
  "subscribe-push-manager-button",
);
const segmentationTagsInput = document.getElementById(
  "segmentation-tags-input",
);
const notificationBarElement = document.getElementById("notification-bar");

const printMessageInNotificationBar = (message) => {
  const notificationElement = document.createElement("div");
  notificationElement.textContent = message;

  notificationBarElement.appendChild(notificationElement);
};

subscribePushManagerButton.addEventListener("click", async (event) => {
  console.log('Clicking the "Subscribe to push manager" button');

  // format comma separated tag values
  const segmentationTags = segmentationTagsInput.value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => !!item);

  // wait for the service worker to be "ready"
  const registration = await navigator.serviceWorker.ready;

  // subscribe to push server
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: vapidPublicKey,
  });

  const subscriptionContainer = { subscription, segmentationTags };

  console.log(
    `Push subscription details: ${JSON.stringify(subscriptionContainer)}`,
  );

  // send the push subscription including the segmentation tags to the backend
  const response = await fetch("/push-subscription", {
    method: "POST",
    body: JSON.stringify(subscriptionContainer),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (response.status >= 200 && response.status < 300) {
    console.log("Push subscription send to backend server");
  }
});

const sendNotification = (message, body) => {
  new Notification(message, {
    body,
    icon: "/assets/wave-icon.png",
  });
};
