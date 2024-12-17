import * as udp from 'dgram';

const port = 5555
const hostname = 'localhost'

const client = udp.createSocket('udp4')
client.on('message', (message, remoteInfo) => {
	console.log(`Remote information: ${JSON.stringify(remoteInfo)}`)
	console.log('Received message', message.toString())
	client.close()
})

const packet = Buffer.from('Moin')
client.send(packet, port, hostname, (err) => {
	if (err) {
		console.error('Error sending message', err);
	}
})