// server.js
const http = require('http');
const fs = require('fs');
const url = require('url');

const server = http.createServer((req, res) => {
    const reqUrl = url.parse(req.url, true);
    const { pathname } = reqUrl;

    if (pathname === '/saveScores') {
        let body = '';
        req.on('data', (chunk) => {
            body += chunk.toString();
        });
        req.on('end', () => {
            fs.writeFileSync('./scores.txt', body);
            res.end();
        });
    } else if (pathname === '/loadScores') {
        fs.readFile('scores.txt', (err, data) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.write('Scores file not found');
                res.end();
            } else {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.write(data);
                res.end();
            }
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.write('Page not found');
        res.end();
    }
});

const port = 3000;
server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
