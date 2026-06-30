import DatabaseService from './service/Database.js';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http'; 
import fs from 'fs';

const databaseService = new DatabaseService();
const currentFilePath = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFilePath);

const server = http.createServer(async (request, response) => {
  const isImageRequest = request.url.match(/\.(png|jpg|jpeg|gif|svg)$/i);

  if (request.url === '/') {
    const indexPath = path.join(currentDirectory, '..', 'client', 'index.html');

    fs.readFile(indexPath, (error, fileContent) => {
      if (error) {
        response.statusCode = 500;
        response.end('Error loading index.html');
      } else {
        response.statusCode = 200;
        response.setHeader('Content-Type', 'text/html');
        response.end(fileContent);
      }
    });

  } else if (isImageRequest) {
    const imagePath = path.join(currentDirectory, '..', 'client', request.url);
    
    fs.readFile(imagePath, (error, fileContent) => {
      if (error) {
        response.statusCode = 404;
        response.end('Image not found');
      } else {
        const fileExtension = isImageRequest[1].toLowerCase();
        const mimeType = fileExtension === 'svg' ? 'image/svg+xml' : `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`;
        
        response.statusCode = 200;
        response.setHeader('Content-Type', mimeType);
        response.end(fileContent);
      }
    });

  } else if (request.url.startsWith('/create')) {
    const urlParts = request.url.split("?");
    const targetUrl = urlParts[1];

    if (!targetUrl) {
      response.statusCode = 400;
      return response.end('Error: Please provide a URL.');
    }

    try {
      const newShortCode = await databaseService.createLink(targetUrl);
      
      response.statusCode = 200;
      response.setHeader('Content-Type', 'text/plain');
      response.end('Success! Your shortened link is: ' + newShortCode);
      
    } catch (error) {
      console.error("Server Error:", error);
      response.statusCode = 500;
      response.end('Internal Server Error');
    }
    
  } else {
    const shortUrlRegex = /^\/([a-zA-Z0-9]{5})$/;
    const shortCodeMatch = request.url.match(shortUrlRegex);

    if (shortCodeMatch) {
      try {
        const shortCode = shortCodeMatch[1];
        const originalUrl = await databaseService.getLongUrl(shortCode);
        
        if (originalUrl) {
          response.statusCode = 302;
          response.setHeader('Location', originalUrl);
          return response.end();
        } else {
          response.statusCode = 404;
          return response.end('Link not found.');
        }
      } catch (error) {
        console.error("Database Lookup Error:", error);
        response.statusCode = 500;
        return response.end('Internal Server Error');
      }
    } else {
      response.statusCode = 404;
      response.end('Error 404: Page not found.');
    }
  }
});

const SERVER_PORT = 3000;
server.listen(SERVER_PORT, () => {
  console.log(`Server is running at http://localhost:${SERVER_PORT}/`);
});