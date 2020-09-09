
import { readFileSync } from 'fs';
import { readAcmi } from './acmi-reader.mjs';

const content = readFileSync('test.txt.acmi', 'utf-8');
console.log("File read from disk, length: ", content.length);

const result = readAcmi(content);
console.log("Got result", result);