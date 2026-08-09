import fs from 'fs';

const code = fs.readFileSync('src/App.tsx', 'utf8');
const lines = code.split('\n');

const tabStart = 1283;
const tabEnd = 2629;
const tabLines = lines.slice(tabStart, tabEnd);

const fullText = tabLines.join('\n');

// Let's parse with babel to see where the mismatch is.
import { parse } from '@babel/parser';

// Let's do a bisection parse on tabLines directly: 
// we will parse tabLines.slice(0, N) after enclosing it in:
// export default function Test() { return ( <div>  ...  </div> ); }
// but we must close any open tag. Since checkTags returned leftovers: [], 
// all JSX tags are balanced! So we just need to append the correct number of closing braces/parentheses.

for (let N = 1; N <= tabLines.length; N++) {
  const slice = tabLines.slice(0, N);
  
  // Count unmatched { and ( in the slice
  let braces = 0;
  let parens = 0;
  
  // We will count them carefully
  let str = slice.join('\n');
  // Strip strings and comments
  str = str.replace(/\/\*[\s\S]*?\*\//g, '');
  str = str.replace(/\/\/.*$/gm, '');
  
  // Strip quotes to avoid counting braces inside strings
  str = str.replace(/"(?:[^"\\]|\\.)*"/g, '""');
  str = str.replace(/'(?:[^'\\]|\\.)*'/g, "''");
  str = str.replace(/`(?:[^`\\]|\\.)*`/g, "``");
  
  for (let char of str) {
     if (char === '{') braces++;
     if (char === '}') braces--;
     if (char === '(') parens++;
     if (char === ')') parens--;
  }
  
  // Create test code with proper closing braces
  let suffix = '';
  if (parens > 0) suffix += ' true' + ')'.repeat(parens);
  if (braces > 0) suffix += '}'.repeat(braces);
  
  const testCode = `
    export default function Test() {
      return (
        <div>
          ${slice.join('\n')}
          ${suffix}
        </div>
      );
    }
  `;
  
  try {
    parse(testCode, { sourceType: "module", plugins: ["jsx", "typescript"] });
  } catch (err) {
    console.log(`Bisection failed at N = ${N} (App.tsx line ${N + tabStart})`);
    console.log(`Error: ${err.message}`);
    // Print the last 5 lines of the slice
    console.log("Last 5 lines of slice:");
    for (let j = Math.max(0, N - 5); j < N; j++) {
       console.log(`  ${j + tabStart + 1}: ${tabLines[j]}`);
    }
    break;
  }
}
