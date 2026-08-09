import fs from 'fs';
const code = fs.readFileSync('src/App.tsx', 'utf8');
let tabLines = code.split('\n').slice(1284, 2629);

function getMismatches(lines) {
  // strip comments and strings to be accurate
  let str = lines.join('\n');
  str = str.replace(/\/\*[\s\S]*?\*\//g, '');
  str = str.replace(/\/\/.*$/gm, '');
  str = str.replace(/"(?:[^"\\]|\\.)*"/g, '""');
  str = str.replace(/'(?:[^'\\]|\\.)*'/g, "''");
  str = str.replace(/`(?:[^`\\]|\\.)*`/g, "``");
  
  let stack = [];
  let linesArr = str.split('\n');
  
  for (let i = 0; i < str.length; i++) {
       let c = str[i];
       if (c === '{' || c === '(') stack.push({c, idx: i});
       if (c === '}' || c === ')') {
          let top = stack[stack.length - 1];
          if (c === '}' && top && top.c === '{') stack.pop();
          else if (c === ')' && top && top.c === '(') stack.pop();
          else {
             return { error: 'Mismatch ' + c, text_index: i };
          }
       }
  }
  return { leftovers: stack.length };
}

console.log(getMismatches(tabLines));
