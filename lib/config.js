export default {
  serverHost: process.env.SERVER_HOST ?? '0.0.0.0',
  serverPort: process.env.SERVER_PORT ?? 3000,
  vapidSubject: process.env.VAPID_SUBJECT ?? 'mailto:vapid@example.com',
  vapidPublicKey: process.env.VAPID_PUBLIC_KEY,
  vapidPrivateKey: process.env.VAPID_PRIVATE_KEY,
};
