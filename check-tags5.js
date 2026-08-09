import fs from 'fs';

const code = fs.readFileSync('src/App.tsx', 'utf8');

const themeBlock = code.split('\n').slice(2763, 3382).join('\n');

let tagStack = [];
const lines = themeBlock.split('\n');

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  const regex = /<\/?([a-zA-Z0-9]+)[^>]*>/g;
  let match;
  while ((match = regex.exec(line)) !== null) {
    let fullTag = match[0];
    const tagName = match[1];
    
    if (fullTag.endsWith('/>')) continue;
    if (['input', 'img', 'br', 'hr', 'source', 'path', 'svg', 'circle', 'line'].includes(tagName)) continue;
    if (tagName[0] === tagName[0].toUpperCase()) continue;
    
    if (fullTag.startsWith('</')) {
      if (tagStack.length > 0 && tagStack[tagStack.length - 1].name === tagName) {
        tagStack.pop();
      } else {
        console.log(`Mismatch on line ${i + 2763 + 1}: expected closing for ${tagStack.length > 0 ? tagStack[tagStack.length - 1].name : 'none'}, but got </${tagName}>.`);
      }
    } else {
      tagStack.push({ name: tagName, line: i + 2763 + 1, content: fullTag });
    }
  }
}
if (tagStack.length > 0) {
  console.log('UNCLOSED TAG COMPARED TO EXPECTATIONS:');
  tagStack.forEach(t => console.log(t.name, t.line));
} else {
  console.log('PERFECTLY BALANCED');
}
