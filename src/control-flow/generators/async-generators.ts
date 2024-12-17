import { createReadStream } from 'fs';
import { createInterface } from 'readline';

async function* readLinesFromFile(filePath: string) {
    const stream = createReadStream(filePath, { encoding: 'utf8' });
    const rl = createInterface({
        input: stream,
        crlfDelay: Infinity,
    });

    for await (const line of rl) {
        yield line;
    }
}

async function processLogFile() {
    const logFilePath = 'logs.txt';
    for await (const line of readLinesFromFile(logFilePath)) {
        console.log('Processing log line:', line);
    }
}
processLogFile().catch((err) => console.error('Error processing log file:', err));