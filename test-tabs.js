import fs from 'fs';
import { parse } from '@babel/parser';

const code = fs.readFileSync('src/App.tsx', 'utf8');
const beforeApp = code.split(/(return \(\s*<div className="flex flex-col h-screen bg-black text-white font-sans overflow-hidden">)/)[0];
const afterApp = `
        </section>
      </main>
    </div>
  );
}`;

let attempt = `function MockApp() {
  return (
    <div className="flex flex-col h-screen bg-black text-white font-sans overflow-hidden">
      <main className="flex-1 flex flex-col lg:flex-row min-h-0 relative z-10 overflow-hidden">
        <section className="left">
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
`;

// Slice the tabs:
let tabs = code.split('            {/* TAB: ').slice(1);
tabs = tabs.map(t => '            {/* TAB: ' + t);
// Split contact tab to end of its block
if (tabs[4]) {
  tabs[4] = tabs[4].split('          </div>\n        </section>')[0];
}

console.log("Total tabs:", tabs.length);

for (let i = 0; i < tabs.length; i++) {
   const testBlock = attempt + tabs[i] + "\n          </div>\n        </section>\n      </main>\n    </div>\n  );\n}";
   try {
     parse(testBlock, { plugins: ['jsx', 'typescript'] });
     console.log(`Tab ${i} PARSES OK`);
   } catch (e) {
     console.log(`Tab ${i} ERROR:`, e.message, e.loc);
   }
}
