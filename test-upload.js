const fs = require('fs');
const http = require('http');

const fileContent = fs.readFileSync('sample-users.csv', 'utf8');

const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
const body = `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="sample-users.csv"\r\nContent-Type: text/csv\r\n\r\n${fileContent}\r\n--${boundary}--\r\n`;

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/admin/bulk-upload',
  method: 'POST',
  headers: {
    'Content-Type': `multipart/form-data; boundary=${boundary}`,
    'Content-Length': Buffer.byteLength(body),
  },
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', JSON.parse(data));
  });
});

req.on('error', (err) => console.error('Error:', err.message));
req.write(body);
req.end();
