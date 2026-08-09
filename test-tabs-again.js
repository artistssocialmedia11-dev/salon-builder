import fs from 'fs';
import { parse } from '@babel/parser';

const code = fs.readFileSync('src/App.tsx', 'utf8');

// I will extract just the theme tab content (between 1284 and 2629)
let tabLines = code.split('\n').slice(1284, 2629);

function check(lines) {
  let attempt = `function MockApp() { return (<main><div>\n${lines.join('\n')}\n</div></main>); }`;
  try {
     parse(attempt, { plugins: ['jsx', 'typescript'] });
     return true;
  } catch (e) {
     return false;
  }
}

// Find exactly which line causes 'check' to FAIL when growing from the top.
let goodLines = 1;
for (let i = 1; i <= tabLines.length; i++) {
  // We cannot simply append partial jsx and expect it to parse, because a stray `{` will cause an error.
  // Instead, let's just find the bracket mismatch string-wise but taking strings/comments out completely.
}

// Let's modify `test-brackets4.js` to run on the WHOLE theme tab.
