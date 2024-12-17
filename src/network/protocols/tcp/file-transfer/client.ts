import * as net from 'net';

const client = net.createConnection(8080, 'localhost', () => {
	console.log('Connected to server');

	client.on('data', (data) => {
		console.log('Received data:\n\t', data.toString());
	});

	client.on('error', (error) => {
		console.error('Socket Error', error);
	});

	client.on('close', () => {
		console.log('Socket closed');
	});

	client.on('end', () => {
		console.log('Socket ended');
	});
});
