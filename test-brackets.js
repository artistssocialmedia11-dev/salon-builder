import fs from 'fs';
import { parse } from '@babel/parser';

const code = fs.readFileSync('src/App.tsx', 'utf8');

// I will extract just the theme tab content (between 1284 and 2628)
// And I will try removing lines from the bottom to see where it breaks/fixes 
let tabLines = code.split('\n').slice(1284, 2629);

function check(lines) {
  let attempt = `function MockApp() { return (<>\n${lines.join('\n')}\n</>); }`;
  try {
     parse(attempt, { plugins: ['jsx', 'typescript'] });
     return true;
  } catch (e) {
     return false;
  }
}

// Bisect lines to remove from inside the tab to find the syntax error.
// We know there's a structural bracket parsing issue. 
// A bracket paring algorithm is better for this.

function checkBrackets(lines) {
  let stack = [];
  for (let i = 0; i < lines.length; i++) {
     let line = lines[i];
     for (let j = 0; j < line.length; j++) {
       let c = line[j];
       if (c === '{') stack.push({c, i});
       if (c === '}') {
          if (stack.length && stack[stack.length - 1].c === '{') stack.pop();
          else return {error: "unmatched }", line: i + 1284 + 1};
       }
       if (c === '(') stack.push({c, i});
       if (c === ')') {
          if (stack.length && stack[stack.length - 1].c === '(') stack.pop();
          else return {error: "unmatched )", line: i + 1284 + 1};
       }
     }
  }
  return stack.length === 0 ? "OK" : "leftovers";
}
console.log(checkBrackets(tabLines));
