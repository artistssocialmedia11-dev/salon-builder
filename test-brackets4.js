import fs from 'fs';
const code = fs.readFileSync('src/App.tsx', 'utf8');
let tabLines = code.split('\n').slice(1284, 2629);

function getMismatches(lines) {
  let str = lines.join('\n');
  let origStr = str;
  str = str.replace(/\/\*[\s\S]*?\*\//g, (match) => ' '.repeat(match.length));
  str = str.replace(/\/\/.*$/gm, (match) => ' '.repeat(match.length));
  str = str.replace(/"(?:[^"\\]|\\.)*"/g, (match) => '""' + ' '.repeat(match.length - 2));
  str = str.replace(/'(?:[^'\\]|\\.)*'/g, (match) => "''" + ' '.repeat(match.length - 2));
  str = str.replace(/`(?:[^`\\]|\\.)*`/g, (match) => "``" + ' '.repeat(match.length - 2));
  
  let stack = [];
  
  for (let i = 0; i < str.length; i++) {
       let c = str[i];
       if (c === '{' || c === '(') stack.push({c, idx: i});
       if (c === '}' || c === ')') {
          let top = stack[stack.length - 1];
          if (c === '}' && top && top.c === '{') stack.pop();
          else if (c === ')' && top && top.c === '(') stack.pop();
          else {
             let sub = str.substring(0, i);
             let lineNum = (sub.match(/\n/g) || []).length;
             console.log("Original line:", origStr.split('\n')[lineNum]);
             return { error: 'Mismatch ' + c, line: lineNum + 1284 };
          }
       }
  }
  return { leftovers: stack.map(s => s.c).join('') };
}

console.log(getMismatches(tabLines));
