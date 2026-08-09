import fs from 'fs';
import { parse } from '@babel/parser';

const code = fs.readFileSync('src/App.tsx', 'utf8');
const lines = code.split('\n');

for (let i = 1284; i < 2629; i += 20) {
   let piece = lines.slice(1284, i).join('\n');
   let attemptStr = `function Mock() { return (<main>${piece}`;
   // To make it valid, we just count the number of open tags using a simple HTML parser
   // Actually, wait, parsing abruptly cut JSX is hard.
}
