const http = require('http');
const formidable = require('formidable');
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');

const server = http.createServer((req, res) => {
  if (req.url === '/convert' && req.method.toLowerCase() === 'post') {
    const form = new formidable.IncomingForm();
    form.uploadDir = path.join(__dirname, 'uploads');
    form.keepExtensions = true;

    form.parse(req, (err, fields, files) => {
      if (err) {
        console.error('Error parsing form:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Error parsing form' }));
        return;
      }

      const videoPath = files.video.path;
      const outputPath = path.join(__dirname, 'public', 'output.mp4');

      ffmpeg.setFfmpegPath(ffmpegPath);

      ffmpeg()
        .input(videoPath)
        .output(outputPath)
        .on('end', () => {
          console.log('Conversion finished');
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ videoUrl: `http://localhost:3001/output.mp4` }));
        })
        .on('error', (err) => {
          console.error('Error during conversion:', err);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Error during conversion' }));
        })
        .run();
    });
  } else {
    // Handle other routes or static files if needed
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
