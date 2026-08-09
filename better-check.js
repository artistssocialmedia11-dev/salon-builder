import fs from 'fs';
import { parse } from '@babel/parser';
import _traverse from '@babel/traverse';
const traverse = _traverse.default;

const code = fs.readFileSync('src/App.tsx', 'utf8');

try {
  const ast = parse(code, { sourceType: 'module', plugins: ['jsx', 'typescript'] });
} catch (e) {
  console.log("Syntax error at", e.loc);
  console.log("Error message:", e.message);
  
  // We can try to repair locally to see where it breaks
  let lines = code.split('\n');
  let lineText = lines[e.loc.line - 1];
  console.log("Line:", lineText);
}
