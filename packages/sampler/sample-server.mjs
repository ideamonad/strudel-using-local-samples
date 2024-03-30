#!/usr/bin/env node

import cowsay from 'cowsay';
import { createReadStream } from 'fs';
import { readdir } from 'fs/promises';
import http from 'http';
import { join } from 'path';

console.log(
  cowsay.say({
    text: 'welcome to @strudel/sampler',
    e: 'oO',
    T: 'U ',
  }),
);

async function getFilesInDirectory(directory) {
  let files = [];
  const dirents = await readdir(directory, { withFileTypes: true });
  for (const dirent of dirents) {
    const fullPath = join(directory, dirent.name);
    if (dirent.isDirectory()) {
      const subFiles = await getFilesInDirectory(fullPath);
      files = files.concat(subFiles);
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

async function getBanks(directory) {
  // const directory = resolve(__dirname, '.');
  let files = await getFilesInDirectory(directory);
  let banks = {};
  files = files
    .filter((f) => ['wav', 'mp3', 'ogg'].includes(f.split('.').slice(-1)[0].toLowerCase()))
    .map((url) => {
      const [bank] = url.split('/').slice(-2);
      banks[bank] = banks[bank] || [];
      url = url.replace(directory, '');
      banks[bank].push(url);
      return url;
    });
  banks._base = `http:localhost:5432`;
  return { banks, files };
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const directory = process.cwd();
  const { banks, files } = await getBanks(directory);
  if (req.url === '/') {
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify(banks));
  }
  if (!files.includes(req.url)) {
    res.statusCode = 404;
    res.end('File not found');
    return;
  }
  const filePath = join(directory, req.url);
  const readStream = createReadStream(filePath);
  readStream.on('error', (err) => {
    res.statusCode = 500;
    res.end('Internal server error');
    console.error(err);
  });
  readStream.pipe(res);
});

const port = 5432;
server.listen(port, () => {
  console.log(`@strudel/sampler is running on http://localhost:${port}`);
});
