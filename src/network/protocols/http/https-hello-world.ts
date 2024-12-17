import * as https from 'https';
import * as fs from 'fs';

/**
 * 1. private key
 * openssl genrsa -out key.pem
 *
 * 2. certificate signing request (CSR)
 * openssl req -new -key key.pem -out csr.pem
 *
 * 3. certificate
 * openssl x509 -req -days 365 -in csr.pem -signkey key.pem -out cert.pem
 *
 */
const key = fs.readFileSync('key.pem', 'utf8');
const cert = fs.readFileSync('cert.pem', 'utf8');
https.createServer({
	key,
	cert
}, (req, res) => {
	res.writeHead(200);
	res.end('hello world\n');
}).listen(8000);