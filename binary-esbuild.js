import fs from 'fs';
import { execSync } from 'child_process';

const code = fs.readFileSync('src/App.tsx', 'utf8');
let tabLines = code.split('\n').slice(1284, 2629);

for (let i = tabLines.length; i >= 1; i--) {
  let attempt = `export default function MockApp() {\nconst activeTab = "theme";\nreturn (\n<main><div>\n`;
  let slice = tabLines.slice(0, i).join('\n');
  attempt += slice + "\n</div></main>\n);\n}";
  
  fs.writeFileSync('temp.tsx', attempt);
  try {
     execSync('npx esbuild temp.tsx --jsx=preserve 2>/dev/null');
     console.log("Success with", i, "lines!");
     break;
  } catch (e) {
     // failed
  }
}
