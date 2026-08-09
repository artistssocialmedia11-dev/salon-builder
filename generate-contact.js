import fs from 'fs';
import { parse } from '@babel/parser';

const code = fs.readFileSync('src/App.tsx', 'utf8');

// The contact tab is from 2764 to 3384
let tabLines = code.split('\n').slice(2764, 3385);

for (let i = 1; i <= tabLines.length; i++) {
  let attempt = `function MockApp() { return (<main><div>\n`;
  let slice = tabLines.slice(0, i).join('\n');
  attempt += slice + "\n</div></main>); }";

  try {
     parse(attempt, { plugins: ['jsx', 'typescript'] });
  } catch (e) {
     if (e.message.includes('Unterminated JSX contents') || e.message.includes('Adjacent JSX elements')) {
         // this is normal if it's abruptly cut
     } else {
         if (!e.message.includes('Expected corresponding JSX closing tag')) {
           // wait, what is the exact error at 3384?
           // I'm looking for "The character } is not valid" or unexpected token
         }
     }
  }
}

// better to do this with Esbuild
fs.writeFileSync('test-contact.tsx', `
export default function MockApp() {
  const activeTab = "contact";
  const siteConfig = {} as any;
  const setSiteConfig = {} as any;
  const updateSocialLink = {} as any;
  const setUseSameNumber = {} as any;
  const useSameNumber = false;
  const cleanAndFormatIndianNumber = {} as any;
  const notifyShort = {} as any;
  const setBusinessHour = {} as any;
  const toggleBusinessDay = {} as any;
  const addHoliday = {} as any;
  const removeHoliday = {} as any;
  const updateHoliday = {} as any;
  const addGalleryImage = {} as any;
  const removeGalleryImage = {} as any;
  const updateGalleryMetadata = {} as any;
  const generateAICopy = {} as any;
  const aiLoading = {} as any;
  const setSeoQuery = {} as any;
  const seoQuery = "";
  
  return (
    <>
      ${tabLines.join('\n')}
    </>
  );
}
`);
