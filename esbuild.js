import * as esbuild from 'esbuild';
import { copyFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';

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
  }
};

if (WATCH) {
  const context = await esbuild.context(buildOptions);
  await context.watch();
  console.log('Watching for changes...');
} else {
  await esbuild.build(buildOptions);
  console.log('Build complete');
}
