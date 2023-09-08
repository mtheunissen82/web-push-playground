# Web push playground

## Getting started

Before installing the playground, ensure your browser of choice is allowed to receive notifications:

- Mac: System Settings > Notification > [browser app] > Allow notifications
- Windows: ?
- Linux: ?

Install the playground:

- Install dependencies `npm ci`
- Run server `npm start`
- Open browser with url `http://localhost:3000` and open devtools console to see the logs

## Project structure

```markdown
├── lib <-- server related logic
├── public <-- client related logic
└── vapid <-- vapid public and private keys that are used throughout the project
```

## Generate VAPID keys

If needed you can regenerate a fresh VAPID keypair with `npx web-push generate-vapid-keys`

## Useful sources

- [MDN Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [MDN Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [MDN Using Service Worker Guide](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers)
- [Service worker lifecycle](https://web.dev/service-worker-lifecycle/)
- [Mozilla blog: Sending VAPID webpush notifications](https://blog.mozilla.org/services/2016/08/23/sending-vapid-identified-webpush-notifications-via-mozillas-push-service/)
