import * as esbuild from 'esbuild';
import { copyFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const WATCH = process.argv.includes('--watch');

// Ensure dist directory exists
if (!existsSync('./dist')) {
  await mkdir('./dist');
}

// Copy static files
await copyFile('./src/login.html', './dist/login.html');
await copyFile('./src/sign.html', './dist/sign.html');

// Build configuration
const buildOptions = {
  entryPoints: ['./src/main.js'],
  bundle: true,
  format: 'esm',
  outfile: './dist/main.js',
  minify: !WATCH,
  sourcemap: WATCH,
  loader: {
    '.png': 'dataurl',
    '.svg': 'dataurl'
  },
  target: ['es2020'],
  platform: 'browser',
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    'global': 'window',
  },
  inject: [path.join(new URL('.', import.meta.url).pathname, 'src/polyfills.js')],
  alias: {
    // Add browser-compatible alternatives for Node.js built-in modules
    crypto: 'crypto-browserify',
    stream: 'stream-browserify',
    buffer: 'buffer',
    util: 'util',
    path: 'path-browserify',
    http: 'stream-http',
    https: 'https-browserify',
    events: 'events',
    url: 'url',
    fs: 'browserify-fs'
  },
};

if (WATCH) {
  const context = await esbuild.context(buildOptions);
  await context.watch();
  console.log('Watching for changes...');
} else {
  await esbuild.build(buildOptions);
  console.log('Build complete');
}
