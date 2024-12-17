import * as net from 'net';

const HttpSectionSeparator = "\r\n\r\n";

export type RequiredHttpRequestHeaders = "method" | "path" | "version";
export type HttpRequestHeaders = Record<RequiredHttpRequestHeaders | string, string>;

const readRequestHeaders = (socket: net.Socket): HttpRequestHeaders => {
	const parseHeaders = (buffer: Buffer): HttpRequestHeaders => {
		const [firstRow, ...lines] = buffer.toString().split("\r\n");

		const parseLine = (line: string): [string, string] | undefined => {
			const keyValSeparatorIdx = line.indexOf(":")
			if (keyValSeparatorIdx !== -1) {
				const header = line.slice(0, keyValSeparatorIdx).toLowerCase().trim();
				const value = line.slice(keyValSeparatorIdx + 1).trimStart()
				return [header.trim(), value]
			}
			return undefined;
		}

		const [method, path, version] = firstRow.split(" ");
		return {
			method, path, version,
			...Object.fromEntries(lines.map(parseLine).filter((x): x is [string, string] => x !== undefined))
		}
	}

	let buffer = Buffer.alloc(0);
	let chunk;
	while (null !== (chunk = socket.read())) {
		buffer = Buffer.concat([buffer, chunk]);
		const headerEndIdx = buffer.indexOf(HttpSectionSeparator);
		if (headerEndIdx !== -1) {
			const potentialBodyStartIdx = headerEndIdx + Buffer.byteLength(HttpSectionSeparator, 'utf8');
			buffer.subarray(potentialBodyStartIdx, buffer.length)
			socket.unshift(buffer.subarray(potentialBodyStartIdx, buffer.length));
			return parseHeaders(buffer.subarray(0, headerEndIdx));
		}
	}
	return parseHeaders(buffer);
}

export const createHttpServer = (handler: (headers: HttpRequestHeaders, socket: net.Socket, createResponse: (statusCode: number, statusText: string, body: string) => string) => void) => {
	return net.createServer((socket) => {
		socket.once('readable', () => {
			const headers = readRequestHeaders(socket);
			handler(headers, socket, (statusCode, statusText, body) => {
				return `${headers.version} ${statusCode} ${statusText}\r\n\r\n${body}`;
			});
		});
	});
}

createHttpServer((headers, socket, createResponse) => {
	const responseBody = JSON.stringify(headers, null, 2);
	socket.end(createResponse(200, 'OK', responseBody));
}).listen(80, () => {
	console.log('Server started on port 80');
});


