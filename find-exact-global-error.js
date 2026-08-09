import fs from 'fs';
import { parse } from '@babel/parser';

try {
  const code = fs.readFileSync('src/App.tsx', 'utf8');
  parse(code, { sourceType: "module", plugins: ["jsx", "typescript"] });
  console.log("App.tsx parsed successfully by Babel!");
} catch (err) {
  console.error("Babel parser error:");
  console.error(err.message);
  if (err.loc) {
    console.error(`Location: Line ${err.loc.line}, Column ${err.loc.column}`);
    const lines = fs.readFileSync('src/App.tsx', 'utf8').split('\n');
    const start = Math.max(0, err.loc.line - 10);
    const end = Math.min(lines.length, err.loc.line + 10);
    for (let i = start; i < end; i++) {
      const prefix = i + 1 === err.loc.line ? '=> ' : '   ';
      console.log(`${prefix}${String(i + 1).padStart(4)}: ${lines[i]}`);
    }
  }
}
