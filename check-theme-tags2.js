import fs from 'fs';

const code = fs.readFileSync('src/App.tsx', 'utf8');
const lines = code.split('\n');

const tabStart = 1283;
const tabEnd = 2629;
const tabLines = lines.slice(tabStart, tabEnd);

function stripBraces(str) {
  // Let's replace curly-braced expressions with spaces of the same length
  let chars = str.split('');
  let len = chars.length;
  let i = 0;
  
  while (i < len) {
    if (chars[i] === '{') {
      let depth = 1;
      let start = i;
      chars[i] = ' ';
      i++;
      while (i < len && depth > 0) {
        // handle strings inside curly braces to avoid brace confusion
        if (chars[i] === '"' || chars[i] === "'" || chars[i] === '`') {
          let quote = chars[i];
          chars[i] = ' ';
          i++;
          while (i < len && chars[i] !== quote) {
            if (chars[i] === '\\') {
              chars[i] = ' ';
              i++;
            }
            chars[i] = ' ';
            i++;
          }
          if (i < len) chars[i] = ' ';
        } else if (chars[i] === '{') {
          depth++;
          chars[i] = ' ';
        } else if (chars[i] === '}') {
          depth--;
          chars[i] = ' ';
        } else {
          chars[i] = ' ';
        }
        i++;
      }
    } else {
      i++;
    }
  }
  return chars.join('');
}

function checkTags(slice) {
  let str = slice.join('\n');
  
  // Strip comments
  str = str.replace(/\/\*[\s\S]*?\*\//g, (match) => ' '.repeat(match.length));
  str = str.replace(/\/\/.*$/gm, (match) => ' '.repeat(match.length));
  
  // Strip JavaScript curly brace expressions inside JSX first!
  str = stripBraces(str);
  
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

console.log("Checking entire theme tab tags (with brace scrubbing)...");
const result = checkTags(tabLines);
console.log(result);
if (result.leftovers && result.leftovers.length > 0) {
  console.log("\nLeftover unclosed tags:", result.leftovers);
}
