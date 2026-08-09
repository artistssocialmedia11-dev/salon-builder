import fs from 'fs';
import { parse } from '@babel/parser';

const code = fs.readFileSync('src/App.tsx', 'utf8');
let tabs = code.split('            {/* TAB: ').slice(1);
tabs = tabs.map(t => '            {/* TAB: ' + t);

const themeStr = tabs[1];

let attempt = `function MockApp() { return (<main><div>`;

const themeSections = themeStr.split('                {/* SECTION');
console.log("Total sections in theme:", themeSections.length);

for (let i = 0; i < themeSections.length; i++) {
   const sectionSnippet = i === 0 ? themeSections[0] : '                {/* SECTION' + themeSections[i];
   const testBlock = attempt + sectionSnippet + "\n</div></main>); }";
   try {
     parse(testBlock, { plugins: ['jsx', 'typescript'] });
   } catch (e) {
     console.log(`Theme Section ${i} ERROR:`, e.message, e.loc);
   }
}

const contactStr = tabs[4].split('          </div>\n        </section>')[0];
const contactSections = contactStr.split('                  {/*');
console.log("Total sections in contact:", contactSections.length);

for (let i = 0; i < contactSections.length; i++) {
   const sectionSnippet = i === 0 ? contactSections[0] : '                  {/*' + contactSections[i];
   const testBlock = attempt + sectionSnippet + "\n</div></main>); }";
   try {
     parse(testBlock, { plugins: ['jsx', 'typescript'] });
   } catch (e) {
     console.log(`Contact Section ${i} ERROR:`, e.message, e.loc);
   }
}
