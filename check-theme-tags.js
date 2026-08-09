import fs from 'fs';
import { parse } from '@babel/parser';

const code = fs.readFileSync('src/App.tsx', 'utf8');
const lines = code.split('\n');

const tabStart = 1283;
const tabEnd = 2629;
const tabLines = lines.slice(tabStart, tabEnd);

const htmlTags = [
  'div', 'section', 'span', 'p', 'button', 'input', 'textarea', 'select', 'option', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'label', 'svg', 'path', 'g', 'circle', 'rect', 'line', 'polyline', 'nav', 'img', 'br', 'hr', 'a', 'b', 'i', 'strong', 'em', 'small', 'ul', 'li', 'ol'
];

function checkTags(slice) {
  let str = slice.join('\n');
  
  // Strip comments and strings
  str = str.replace(/\/\*[\s\S]*?\*\//g, (match) => ' '.repeat(match.length));
  str = str.replace(/\/\/.*$/gm, (match) => ' '.repeat(match.length));
  
  // We need to keep JSX tags. Let's find matches of <tag ...> or </tag>.
  // A regex to match tags.
  const tagRegex = /<\/?[A-Za-z0-9_.-]+(?:\s+[^>]*?)?>/g;
  
  let match;
  let stack = [];
  
  while ((match = tagRegex.exec(str)) !== null) {
    const rawTag = match[0];
    const index = match.index;
    
    // Check if it's self-closing
    if (rawTag.endsWith('/>')) {
      continue;
    }
    
    // Extract tag name
    const matches = rawTag.match(/^<\/?([A-Za-z0-9_.-]+)/);
    if (!matches) continue;
    
    const tagName = matches[1];
    
    // Ignore component/capitalized elements if we want, or keep all. Let's keep all.
    const isClosing = rawTag.startsWith('</');
    
    let sub = str.substring(0, index);
    let lineNum = (sub.match(/\n/g) || []).length + tabStart + 1;
    
    if (!isClosing) {
      stack.push({ name: tagName, line: lineNum, raw: rawTag });
    } else {
      if (stack.length === 0) {
        return { error: `Extra closing tag </${tagName}>`, line: lineNum, stack };
      }
      
      const top = stack[stack.length - 1];
      if (top.name === tagName) {
        stack.pop();
      } else {
        return { error: `Mismatch: closing </${tagName}> but expected closing for <${top.name}> (opened at line ${top.line})`, line: lineNum, stack };
      }
    }
  }
  
  return { status: "OK", leftovers: stack };
}

console.log("Checking entire theme tab tags...");
const result = checkTags(tabLines);
console.log(result);
if (result.leftovers && result.leftovers.length > 0) {
  console.log("\nLeftover unclosed tags:", result.leftovers);
}
