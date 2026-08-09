import fs from 'fs';

const code = fs.readFileSync('src/App.tsx', 'utf8');

const themeBlock = code.slice(
  code.indexOf('{/* SECTION 2: Visibility Controls */}'),
  code.indexOf('{/* TAB: SECTIONS LAYOUT ROWS */}')
);

// We want to count opening tags (excluding <input, <img, <br, <hr, and />)
// and closing tags.

let tagStack = [];
const lines = themeBlock.split('\n');

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Find all tags: <div, </span>, etc.
  const regex = /<\/?([a-zA-Z0-9]+)[^>]*>/g;
  let match;
  while ((match = regex.exec(line)) !== null) {
    const fullTag = match[0];
    const tagName = match[1];
    
    // Ignore self-closing tags
    if (fullTag.endsWith('/>')) continue;
    
    // Ignore void elements
    if (['input', 'img', 'br', 'hr', 'source'].includes(tagName)) continue;
    
    if (fullTag.startsWith('</')) {
      if (tagStack.length > 0 && tagStack[tagStack.length - 1].name === tagName) {
        tagStack.pop();
      } else {
        console.log(`Mismatch on line ${i + 1}: expected closing for ${tagStack.length > 0 ? tagStack[tagStack.length - 1].name : 'none'}, but got </${tagName}>. Tag text: ${fullTag}`);
      }
    } else {
      tagStack.push({ name: tagName, line: i + 1, content: fullTag });
    }
  }
}

if (tagStack.length > 0) {
  console.log('Unclosed tags remain:');
  tagStack.forEach(t => console.log(`- <${t.name}> from line ${t.line} (${t.content})`));
} else {
  console.log('Perfectly matched!');
}
