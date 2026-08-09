import fs from 'fs';

const code = fs.readFileSync('src/App.tsx', 'utf8');
const lines = code.split('\n');
const themeLines = lines.slice(1284, 2628);

// Remove strings and comments preserving lines
let block = themeLines.join('\n');
block = block.replace(/\/\*[\s\S]*?\*\//g, match => match.replace(/[^\n]/g, ' '));
block = block.replace(/\/\/.*$/gm, match => ' '.repeat(match.length));
block = block.replace(/"(?:[^"\\]|\\.)*"/g, match => '"' + ' '.repeat(match.length - 2) + '"');
block = block.replace(/'(?:[^'\\]|\\.)*'/g, match => "'" + ' '.repeat(match.length - 2) + "'");
block = block.replace(/`(?:[^`\\]|\\.)*`/g, match => '`' + match.substring(1, match.length-1).replace(/[^\n]/g, ' ') + '`');

let stack = [];
let i = 0;
while (i < block.length) {
   if (block.substr(i, 2) === '</') {
      let end = block.indexOf('>', i);
      let tagName = block.substring(i+2, end).trim();
      stack.pop(); // assuming it matches
      i = end + 1;
   } else if (block[i] === '<' && /[a-zA-Z]/.test(block[i+1])) {
      let end = block.indexOf('>', i);
      let tagContent = block.substring(i, end+1);
      let tagName = tagContent.match(/<([a-zA-Z0-9]+)/)[1];
      if (!tagContent.endsWith('/>') && !['input', 'img', 'br', 'hr'].includes(tagName.toLowerCase())) {
          // get line num
          let sub = block.substring(0, i);
          let line = (sub.match(/\n/g) || []).length + 1284 + 1;
          stack.push({name: tagName, line: line, content: tagContent});
      }
      i = end + 1;
   } else {
      i++;
   }
}

console.log("Unclosed tags stack:");
for (let s of stack) {
  console.log(s.name, "at line", s.line);
}
