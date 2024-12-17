import * as path from "node:path";
import * as http from "node:http";
import * as fs from "node:fs";

const port = 1337;
// const directoryName = './public';
const directoryName = '../../../';

const MimeTypeTextHtml = 'text/html';
const supportedTypes: Record<string, string> = {
	html: MimeTypeTextHtml,
	css: 'text/css',
	js: 'application/javascript',
	ts: 'application/javascript',
	png: 'image/png',
	jpg: 'image/jpeg',
	jpeg: 'image/jpeg',
	gif: 'image/gif',
	json: 'application/json',
	xml: 'application/xml',
};

const root = path.normalize(path.resolve(directoryName));

const getFilePathIfHasAccess = (filePath: string): {type: 'file', path: string } | undefined => {
	try{
		fs.accessSync(filePath, fs.constants.R_OK);
		return {type: "file", path: filePath };
	}
	catch(e){
		/* ignore */
	}
	return undefined;
}
const getImplicitHtmlFilePath = (url: string): {type: 'file', path: string }   | undefined => {
	return getFilePathIfHasAccess(path.join(root, url + '.html'));
}

const getImplicitIndexHtmlFilePath = (url: string): {type: 'file', path: string }  | undefined => {
	return getFilePathIfHasAccess(path.join(root, url, 'index.html'));
}

const getFilePath = (url: string): undefined | {type: 'directory' | 'file', path: string }=> {
	const filePath = path.join(root, url);

	const isPathUnderRoot = path
		.normalize(path.resolve(filePath))
		.startsWith(root);

	if(!isPathUnderRoot){
		return undefined;
	}

	const fileExists = fs.existsSync(filePath);
	if(!fileExists){
		return getImplicitHtmlFilePath(url);
	}


	if(!getFilePathIfHasAccess(filePath)){
		return undefined;
	}

	const fileStats = fs.lstatSync(filePath);
	if(!fileStats.isDirectory()){
		return {
		type: 'file',
		path: filePath,
		};
	}

	const implicitIndexHtmlFilePath = getImplicitIndexHtmlFilePath(url);
	if(implicitIndexHtmlFilePath){
		return implicitIndexHtmlFilePath;
	}

	return {
		type: 'directory',
		path: filePath,
	};
}

const createHtmlResponseFromFileList = (filePaths: fs.Dirent[], url: string): string => {
	const parentPath = path.join(url, '../');
	const parentRow = url === '/' ||  url === '' ? '' : `<tr><td><a href="${parentPath}">&uarr; Parent directory</a></td><td></td><td></td><td></td></tr>`;

	const createHtmlTableWithFileSizesAndStats = (filePaths: fs.Dirent[], url: string): string => {
		const tableRows = filePaths.map((file) => {
			const filePath = path.join(root, url, file.name);
			const fileUrl = path.join(url, file.name);

			const fileStats = fs.lstatSync(filePath);
			const fileSize = fileStats.isDirectory() ? ' - ' : fileStats.size;
			const fileStatsString = fileStats.mode.toString(8).slice(-3);
			const icon = fileStats.isDirectory() ? '&#128193;' : '&#128196;';
			const lastModified = fileStats.mtime.toISOString().slice(0, 19).replace('T', ' ');
			return `<tr><td><a href="${fileUrl}"> ${icon} ${file.name}</a></td><td>${fileStatsString}</td><td>${fileSize}</td><td>${lastModified}</td></tr>`;
		}).join('\n');

		return `
<table>
	<thead>
		<tr><th>Name</th><th>Mode</th><th>Size</th><th>Last modified</th></tr>
	</thead>
	<tbody>
		${parentRow}
		${tableRows}
	</tbody>
</table>`;
	}

	const title = `Index of ${url}`;
	const body = `<h1>${title}</h1>\n${createHtmlTableWithFileSizesAndStats(filePaths, url)}`;
	return `<!DOCTYPE html>
<html lang="en">
	<head>
		<title>${title}</title>
		<style>
			table {
				border-collapse: collapse;
				
			}
			table, th, td {
				border: 1px solid black;
				
			}
			th, td {
				padding: 5px;
			}
			td:nth-child(even), th:nth-child(even) {
			  background-color: #D6EEEE;
			}
		</style>
	</head>
	<body>${body}</body>
</html>`;
}

const server = http.createServer((req, res) => {
	console.log(`${req.method} ${req.url}`);

	if(req.method !== 'GET'){
		res.writeHead(405, { 'Content-Type': MimeTypeTextHtml });
		res.end('405: Method not allowed');
		return;
	}

	if(!req.url){
		res.writeHead(400, { 'Content-Type': MimeTypeTextHtml });
		res.end('400: Bad Request');
		return;
	}

	const extension = path.extname(req.url).slice(1);
	const mimeType = supportedTypes[extension];
	const filePath = getFilePath(req.url);

	if ((extension && !supportedTypes[extension]) || !filePath) {
		res.writeHead(404, { 'Content-Type': MimeTypeTextHtml });
		res.end('404: File not found');
		return;
	}

	if (filePath.type === 'directory') {
		const filePaths = fs.readdirSync(filePath.path, { withFileTypes: true });
		const html = createHtmlResponseFromFileList(filePaths, req.url);
		res.writeHead(200, { 'Content-Type': MimeTypeTextHtml });
		res.end(html);
	} else {
		fs.readFile(filePath.path, (err, data) => {
			if (err) {
				res.writeHead(404, { 'Content-Type': MimeTypeTextHtml });
				res.end('404: File not found');
			} else {
				res.writeHead(200, { 'Content-Type': mimeType });
				res.end(data);
			}
		});
	}
});

server.listen(port, () => {
	console.log(`Server is listening on port ${port}`);
});