import fs from 'fs';

const code = fs.readFileSync('src/App.tsx', 'utf8');

const themeBlock = code.split('\n').slice(1095, 3390).join('\n');

let tagStack = [];

const regex = /<\/?([a-zA-Z0-9]+)[^>]*>/g;
let match;
const lines = themeBlock.split('\n');

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const lineRegex = /<\/?([a-zA-Z0-9]+)[^>]*>/g;
  let match;
  while ((match = lineRegex.exec(line)) !== null) {
    let fullTag = match[0];
    const tagName = match[1].toLowerCase();
    
    if (fullTag.endsWith('/>')) continue;
    if (['input', 'img', 'br', 'hr', 'source', 'path', 'svg', 'circle', 'line', 'textarea'].includes(tagName)) continue;
    if (match[1][0] === match[1][0].toUpperCase()) continue;
    
    if (fullTag.startsWith('</')) {
      if (tagStack.length > 0 && tagStack[tagStack.length - 1].name === tagName) {
        tagStack.pop();
      } else {
        console.log(`Mismatch at line ${i + 1095 + 1}: expected closing for ${tagStack.length > 0 ? tagStack[tagStack.length - 1].name : 'none'} (opened at ${tagStack.length > 0 ? tagStack[tagStack.length - 1].line : 'none'}), but got </${tagName}>. Tag: ${fullTag}`);
      }
    } else {
      tagStack.push({ name: tagName, content: fullTag, line: i + 1095 + 1 });
    }
  }
}

if (tagStack.length > 0) {
  console.log('UNCLOSED TAGS:');
  tagStack.forEach(t => console.log(t.name, "at line", t.line));
} else {
  console.log('PERFECTLY BALANCED');
}
