import { Buffer } from 'buffer';
window.Buffer = Buffer;
window.process = {
  version: '16.0.0',
  browser: true,
  env: {
    NODE_ENV: 'development'
  }
};