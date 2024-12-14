import { Buffer } from 'buffer';
window.Buffer = Buffer;
window.process = {
  env: {
    NODE_ENV: process.env.NODE_ENV || 'development'
  }
};