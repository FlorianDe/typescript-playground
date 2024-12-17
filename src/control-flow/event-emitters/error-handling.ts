import { EventEmitter, errorMonitor, captureRejectionSymbol } from 'node:events';

// Catch errors using the error event
const basicEmitter = new EventEmitter();
basicEmitter.on('error', (error: Error) => {
	console.error('basicEmitter -> Error occurred', error.message);
});
basicEmitter.emit('error', new Error('Something went wrong'));

// Handle errors using the errorMonitor, before the error event is received by the error event handler
const errorMonitorEmitter = new EventEmitter();
errorMonitorEmitter.on(errorMonitor, (error: Error) => {
	console.error('errorMonitorEmitter -> Error monitoring', error.message);
});
errorMonitorEmitter.on('error', (error: Error) => {
	console.error('errorMonitorEmitter -> Error occurred in onError (without it still throw error)', error.message);
});
errorMonitorEmitter.emit('error', new Error('Something went wrong'));

// TODO NOT WORKING with ts-node rn! tsc -> node
// Handler async errors using the captureRejectionSymbol
// captureRejections: true
// 	The captureRejections option in the EventEmitter constructor or the global setting change this behavior,
// 	installing a .then(undefined, handler) handler on the Promise.
// 	This handler routes the exception asynchronously to the Symbol.for('nodejs.rejection') method if
// 	there is one, or to 'error' event handler if there is none.
const emitterWithAsyncListeners = new EventEmitter({ captureRejections: true });
emitterWithAsyncListeners.on('something', async (value) => {
	throw new Error('kaboom');
});
// emitterWithAsyncListeners.on('error', (error: Error) => {
// 	console.error('emitterWithAsyncListeners -> Error occurred', error.message);
// });
// @ts-ignore
emitterWithAsyncListeners[captureRejectionSymbol] = (err, event, ...args) => {
	console.error('captureRejectionSymbol -> Error', err?.message);
};
emitterWithAsyncListeners.emit('something', 'value');

