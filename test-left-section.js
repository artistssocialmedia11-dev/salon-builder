import fs from 'fs';
import { parse } from '@babel/parser';

const code = fs.readFileSync('src/App.tsx', 'utf8');

const aneo = code.split('\n').slice(1095, 1158);
// We need to add the closing tags that would normally be after the tabs:
let cheatCode = `function f() { return (\n<main>\n${aneo.join('\n')}\n</div>\n</section>\n</main>); }`;
try {
  parse(cheatCode, { plugins: ['jsx', 'typescript'] });
  console.log("1095-1158 parses correctly!");
} catch (e) {
  console.log("1095-1158 fails at line", e.loc.line - 2 + 1095);
  console.log(e.message);
}
