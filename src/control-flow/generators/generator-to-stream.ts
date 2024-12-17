import { Readable } from 'stream';

async function* eventStream() {
    let count = 0;
    while (count < 5) {
        yield `Event ${count}`;
        await new Promise(resolve => setTimeout(resolve, 1000));
        count++;
    }
}

function asyncGeneratorToStream<T>(generator: AsyncGenerator<T, void, unknown>): Readable {
    const stream = new Readable({
        objectMode: true,
        async read() {
            const { done, value } = await generator.next();
            if (done) {
                this.push(null); // End the stream when done
            } else {
                this.push(value); // Push the value to the stream
            }
        },
    });
    return stream;
}

async function processEvents() {
    const generator = eventStream();
    const stream = asyncGeneratorToStream(generator);

    stream.on('data', (data) => {
        console.log('Received:', data);
    });

    stream.on('end', () => {
        console.log('Stream finished');
    });
}
processEvents();