import fs from 'fs';
import { parse } from '@babel/parser';

const code = fs.readFileSync('src/App.tsx', 'utf8');

// I will inject a wrapper to check sections of code
function checkSnippet(start, end) {
   const snippet = code.split('\n').slice(start, end).join('\n');
   try {
     parse(`<main>${snippet}</main>`, { plugins: ['jsx', 'typescript'] });
     return true;
   } catch (e) {
     return false;
   }
}

for (let i = 1090; i < 3380; i += 50) {
   if (!checkSnippet(1090, i)) {
      console.log('Failed around line', i);
      break;
   }
}
