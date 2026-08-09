import fs from 'fs';

const code = fs.readFileSync('src/App.tsx', 'utf8');

const themeBlock = code.split('\n').slice(2763, 3382).join('\n');

let tagStack = [];

const regex = /<\/?([a-zA-Z0-9]+)[^>]*>/g;
let match;
while ((match = regex.exec(themeBlock)) !== null) {
  let fullTag = match[0];
  const tagName = match[1].toLowerCase();
  
  if (fullTag.endsWith('/>')) continue;
  if (['input', 'img', 'br', 'hr', 'source', 'path', 'svg', 'circle', 'line'].includes(tagName)) continue;
  if (match[1][0] === match[1][0].toUpperCase()) continue;
  
  if (fullTag.startsWith('</')) {
    if (tagStack.length > 0 && tagStack[tagStack.length - 1].name === tagName) {
      tagStack.pop();
    } else {
      console.log(`Mismatch: expected closing for ${tagStack.length > 0 ? tagStack[tagStack.length - 1].name : 'none'}, but got </${tagName}>. Tag: ${fullTag}`);
    }
  } else {
    tagStack.push({ name: tagName, content: fullTag });
  }
}

if (tagStack.length > 0) {
  console.log('UNCLOSED TAGS:');
  tagStack.forEach(t => console.log(t.name));
} else {
  console.log('PERFECTLY BALANCED');
}
