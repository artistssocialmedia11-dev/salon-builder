import fs from 'fs';
import { parse } from '@babel/parser';

const code = fs.readFileSync('src/App.tsx', 'utf8');
const lines = code.split('\n');

const tabStart = 1283;
const tabEnd = 2631;
const tabLines = lines.slice(tabStart, tabEnd);

const checkSlice = (sliceLen) => {
  const slice = tabLines.slice(0, sliceLen);
  
  // Create a template that contains the slice. To make it compile, we need to close open tags.
  // We can count open tags of specific type, or let's use a very basic tag counter to auto-close.
  // Wait, actually, let's check for bracket mismatches (curly braces {} and parentheses ()).
  let str = slice.join('\n');
  
  // Strip strings and comments and check braces
  str = str.replace(/\/\*[\s\S]*?\*\//g, (match) => ' '.repeat(match.length));
  str = str.replace(/\/\/.*$/gm, (match) => ' '.repeat(match.length));
  str = str.replace(/"(?:[^"\\]|\\.)*"/g, (match) => '""' + ' '.repeat(match.length - 2));
  str = str.replace(/'(?:[^'\\]|\\.)*'/g, (match) => "''" + ' '.repeat(match.length - 2));
  str = str.replace(/`(?:[^`\\]|\\.)*`/g, (match) => "``" + ' '.repeat(match.length - 2));

  let stack = [];
  for (let i = 0; i < str.length; i++) {
     let c = str[i];
     if (c === '{' || c === '(') {
        stack.push({ c, i });
     } else if (c === '}' || c === ')') {
        if (stack.length > 0) {
           let top = stack[stack.length - 1];
           if ((c === '}' && top.c === '{') || (c === ')' && top.c === '(')) {
              stack.pop();
           } else {
              // Mismatch!
              let sub = str.substring(0, i);
              let lineNum = (sub.match(/\n/g) || []).length + tabStart + 1;
              return { error: `Mismatch ${c} (expected closing for ${top.c})`, line: lineNum };
           }
        } else {
           let sub = str.substring(0, i);
           let lineNum = (sub.match(/\n/g) || []).length + tabStart + 1;
           return { error: `Extra closing ${c}`, line: lineNum };
        }
     }
  }
  return { status: "OK", leftovers: stack.map(s => s.c).join('') };
};

console.log("Full theme tab brace check:", checkSlice(tabLines.length));

// Let's do a bisection where the leftovers change or mismatch occurs.
for (let i = 1; i <= tabLines.length; i++) {
   let res = checkSlice(i);
   if (res.error) {
       console.log(`Brace mismatch found at index ${i} (App.tsx line ${i + tabStart})`);
       console.log(res);
       break;
   }
}
