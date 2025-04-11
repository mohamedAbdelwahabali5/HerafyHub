import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

// Serve static files
app.use(express.static(browserDistFolder, {
  maxAge: '1y',
  index: false,
  redirect: false,
}));

// Handle all routes
app.use('/**', (req, res, next) => {
  // Handle API routes by proxying to your backend
  if (req.originalUrl.startsWith('/api')) {
    return next();
  }

  angularApp
    .handle(req)
    .then((response) => response ? writeResponseToNodeResponse(response, res) : next())
    .catch((err) => {
      console.error('Error during SSR:', err);
      // Fallback to client-side rendering if SSR fails
      res.sendFile(resolve(browserDistFolder, 'index.html'));
    });
});

// Vercel requires module.exports for serverless functions
module.exports = app;
