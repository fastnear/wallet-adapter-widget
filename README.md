# @fastnear/wallet-adapter-widget

Web interface component that provides the UI for the NEAR wallet adapter. This package is designed to work in conjunction with [@fastnear/wallet-adapter](https://github.com/fastnear/wallet-adapter).

## How it Works

The adapter-widget relationship works like this:

1. `@fastnear/wallet-adapter` is used in your dApp to handle wallet interactions
2. When a wallet operation is needed, the adapter creates an iframe pointing to this widget
3. This widget provides the UI for wallet selection and transaction signing
4. The widget communicates back to your dApp through the adapter using postMessage

## Setup

### 1. Host the Widget

Build and deploy this widget to a static hosting service:

```bash
# Build the widget
npm run build

# Deploy contents of dist/ to your hosting
```

### 2. Use the Adapter

In your dApp, install and configure the adapter:

```bash
npm install @fastnear/wallet-adapter
```

```javascript
import { WalletAdapter } from '@fastnear/wallet-adapter';

const adapter = new WalletAdapter({
  // Point to your hosted widget
  widgetUrl: 'https://your-domain.com/wallet-widget'
});

// The adapter will now use your hosted widget for wallet operations
await adapter.signIn({
  networkId: 'mainnet',
  contractId: 'example.near'
});
```

## Development

When developing locally:

```bash
# Install dependencies
npm install

# Start development server
npm run dev
# Widget will be available at http://localhost:3000
```

Then configure the adapter to use your local widget:

```javascript
const adapter = new WalletAdapter({
  widgetUrl: 'http://localhost:3000'
});
```

## Required Routes

The widget must expose two HTML pages:

- `/login.html` - Wallet selection interface
- `/sign.html` - Transaction signing interface

The adapter will automatically load the appropriate page based on the requested operation.

## Production Deployment

For production use:

1. Build the widget:
   ```bash
   npm run build
   ```

2. Deploy the contents of the `dist` directory to your chosen hosting service

3. Update your dApp's adapter configuration to use the production widget URL

## Security Considerations

- The widget should be hosted on a trusted domain
- HTTPS is required for production use
- Consider setting appropriate CORS and CSP headers
- The adapter's `targetOrigin` should be configured to match your widget's domain

## Learn More

- [FastNEAR Wallet Adapter](https://github.com/fastnear/wallet-adapter)
- [NEAR Protocol Documentation](https://docs.near.org)
