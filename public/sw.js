self.addEventListener("install", (event) => {
  console.log("Service worker 'install' event triggered");
  // skipWaiting ensures that a potential new version of the service worker is installed immediatelly.
  // Calling skipWaiting, terminates the active worker and activates the new one
  // see: https://web.dev/service-worker-lifecycle/#skip-the-waiting-phase
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("Service worker 'activate' event triggered");

  // When a service worker is initially registered, pages won't use it until they next load.
  // The claim() method causes those pages to be controlled immediately.
  // see: https://developer.mozilla.org/en-US/docs/Web/API/Clients/claim
  // see: https://web.dev/service-worker-lifecycle/#clientsclaim
  event.waitUntil(clients.claim());
});

// Make the service worker listen to push events
self.addEventListener("push", (event) => {
  handleIncomingPushMessage(event);
});

const handleIncomingPushMessage = async (event) => {
  const data = event.data.json();

  console.log(`Received push message with type data '${JSON.stringify(data)}'`);

  // Show notification
  self.registration.showNotification(data.message);

  // Send to clients (or in other words "connected pages"), that are controlled by this service worker
  const clients = await self.clients.matchAll();

  clients.forEach((client) => {
    console.log(
      `Perform postMessage to client with id='${client.id}' type='${client.type}' url='${client.url}'`,
    );
    client.postMessage({ message: data.message });
  });
};
