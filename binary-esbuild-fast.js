import fs from 'fs';
import { execSync } from 'child_process';

const code = fs.readFileSync('src/App.tsx', 'utf8');
let tabLines = code.split('\n').slice(1284, 2629);

let low = 1;
let high = tabLines.length;
let firstFail = -1;

while (low <= high) {
  let mid = Math.floor((low + high) / 2);
  let attempt = `export default function MockApp() {\nconst activeTab = "theme";\nreturn (\n<main><div>\n`;
  let slice = tabLines.slice(0, mid).join('\n');
  attempt += slice + "\n</div></main>\n);\n}";
  
  fs.writeFileSync('temp.tsx', attempt);
  let ok = false;
  try {
     execSync('npx esbuild temp.tsx --jsx=preserve 2>/dev/null');
     ok = true;
  } catch (e) {
     ok = false;
  }
  
  if (ok) {
     low = mid + 1;
  } else {
     firstFail = mid;
     high = mid - 1;
  }
}

console.log("First failing line length:", firstFail);
console.log("Line content:", tabLines[firstFail - 1]);
console.log("Real file line:", firstFail + 1284);
