import fs from 'fs';

const code = fs.readFileSync('src/App.tsx', 'utf8');

const themeBlock = code.split('\n').slice(1860, 2095).join('\n');

let tagStack = [];
const lines = themeBlock.split('\n');

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  const regex = /<\/?([a-zA-Z0-9]+)[^>]*>/g;
  let match;
  while ((match = regex.exec(line)) !== null) {
    const fullTag = match[0];
    const tagName = match[1];
    
    if (fullTag.endsWith('/>')) continue;
    if (['input', 'img', 'br', 'hr', 'source', 'path', 'svg', 'circle', 'line'].includes(tagName)) continue;
    
    // Ignore uppercase components for now
    if (tagName[0] === tagName[0].toUpperCase()) continue;
    
    if (fullTag.startsWith('</')) {
      if (tagStack.length > 0 && tagStack[tagStack.length - 1].name === tagName) {
        tagStack.pop();
      } else {
        console.log(`Mismatch on line ${i + 1860 + 1}: expected closing for ${tagStack.length > 0 ? tagStack[tagStack.length - 1].name : 'none'}, but got </${tagName}>. Tag text: ${fullTag}`);
      }
    } else {
      tagStack.push({ name: tagName, line: i + 1860 + 1, content: fullTag });
    }
  }
}
