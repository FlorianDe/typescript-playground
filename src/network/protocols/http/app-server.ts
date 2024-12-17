import * as http from 'http';

const createHtmlPage = (title: string, request: http.IncomingMessage) => {
	return `
<!DOCTYPE html>
<html lang="de">
	<head>
		<title>Minimal HTML Page</title>
		<style>
			body {
				background-color: #f0f0f0;
				font-family: Arial, sans-serif;
				margin: 0;
				padding: 20px;
			}
			h1 {
				color: #333333;
				font-size: 24px;
			}
			p {
				color: #666666;
				font-size: 16px;
				line-height: 1.5;
			}
			pre {
				background-color: #b7b7b7;
			}
		</style>
	</head>
	<body>
		<h1>Requested minimal page at ${new Date()}</h1>
		<p>Requested URL: ${request.method} ${request.url}</p>
		<pre>${JSON.stringify(request.headers, null, "\t")}</pre>
	</body>
</html>
`
}

http
	.createServer()
	.on('request', (request, response) => {
		console.log(`==== ${request.method} - ${request.url}`);
		if (request.method === 'GET' && (request.url === '/' || request.url === '')) {
			response.writeHead(200, {'Content-Type': 'text/html'})
			response.end(createHtmlPage('Minimal HTML Page', request));
		} else {
			response.writeHead(301, {'Location': '/'});
			response.end();
		}

		request.on('error', (error) => {
			console.error('Server Error', error);
			response.statusCode = 500;
			response.end();
		});
	})
	.listen(80, () => {
		console.log('Server is listening on port 80');
	});