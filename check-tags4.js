import fs from 'fs';

const code = fs.readFileSync('src/App.tsx', 'utf8');

const themeBlock = code.split('\n').slice(1090, 3384).join('\n');

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
        if (tagName === 'section') {
            console.log(`SECTION CLOSED AT ${i + 1090 + 1}`);
        }
      }
    } else {
      tagStack.push({ name: tagName, line: i + 1090 + 1, content: fullTag });
    }
  }
}

console.log('STACK:');
console.log(tagStack.map((t) => t.name).join(', '));
if (tagStack.length > 0) {
    console.log('Last 5 tags open:');
    tagStack.slice(-5).forEach(t => console.log(`<${t.name}> opened at ${t.line}`));
}
