import { Buffer, transcode } from "node:buffer";
import * as qs from "node:querystring";

// from https://nodejs.org/api/buffer.html

// Creates a zero-filled Buffer of length 10.
const buf1 = Buffer.alloc(10);

// Creates a Buffer of length 10,
// filled with bytes which all have the value `1`.
const buf2 = Buffer.alloc(10, 1);

// Creates an uninitialized buffer of length 10.
// This is faster than calling Buffer.alloc() but the returned
// Buffer instance might contain old data that needs to be
// overwritten using fill(), write(), or other functions that fill the Buffer's
// contents.
const buf3 = Buffer.allocUnsafe(10);
console.log(`buf3: ${buf3}`);

// Creates a Buffer containing the bytes [1, 2, 3].
const buf4 = Buffer.from([1, 2, 3]);

// Creates a Buffer containing the bytes [1, 1, 1, 1] – the entries
// are all truncated using `(value & 255)` to fit into the range 0–255.
const buf5 = Buffer.from([257, 257.5, -255, 1]);

// Creates a Buffer containing the UTF-8-encoded bytes for the string 'tést':
// [0x74, 0xc3, 0xa9, 0x73, 0x74] (in hexadecimal notation)
// [116, 195, 169, 115, 116] (in decimal notation)
const buf6 = Buffer.from("tést");

// Creates a Buffer containing the Latin-1 bytes [0x74, 0xe9, 0x73, 0x74].
const buf7 = Buffer.from("tést", "latin1");
const buf8 = Buffer.from("hello world-chäräcters_test()", "utf8");

console.log(transcode(buf8, "utf8", "latin1").toString("latin1"));

const escapedStr = qs.escape(buf8.toString());
console.log(`escapedStr: ${escapedStr}`);
console.log(`unescapedStr: ${qs.unescape(escapedStr)}`);

console.log(qs.parse("foo=bar&abc=xyz&abc=123"));
console.log(JSON.stringify(qs.parse("statements:50,80;functions:50,80;branches:0,80;lines:50,80", ";", ":")));
