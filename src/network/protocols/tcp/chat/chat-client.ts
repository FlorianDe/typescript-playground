import * as net from 'net';
import * as readline from "readline";
import {Abortable} from "events";

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
	terminal: false
});

const prompt = async (question: string, ac: Abortable): Promise<string> => {
	return new Promise<string>((resolve) => {
		rl.question(question, ac, (answer) => {
			resolve(answer);
		});
	});
}

type Mode = 'logged_out' | 'logged_in' | 'in_channel'

// client.write()
const run = async () => {
	let mode: Mode = 'logged_out';
	let ac = new AbortController();
	const client = net.createConnection(42, 'localhost', async () => {
		console.log('Connected to server');

		client.on('data', (data) => {
			// console.log('Received data:\n\t', data.toString());
			console.log(data.toString())
			mode = 'logged_in';
		});

		client.on('error', (error) => {
			console.error('Socket Error', error);
			process.exit(-1)
		});

		client.on('close', () => {
			console.log('Socket closed');
			ac.abort();
		});

		client.on('end', () => {
			console.log('Socket ended');
			process.exit(-1)
		});


		while (true) {
			switch (mode) {
				case 'logged_out': {
					console.log('Login or register: ')
					const message = await prompt('', ac);
					client.write(message);
					break;
				}
				case 'logged_in': {
					const message = await prompt('', ac);
					client.write(message);
					break;
				}
				case 'in_channel': {
					const message = await prompt('', ac);
				}
			}
		}
	});
}


run().then();