import fs from 'fs';
import { parse } from '@babel/parser';

const code = fs.readFileSync('src/App.tsx', 'utf8');
const lines = code.split('\n');

// We will parse the file up to line N. To make it a valid program,
// we will append necessary closing braces/tags depending on where we cut.
// But wait, we can also just parse function blocks or subcomponents.
// Let's find exactly which of the tabs (branding, theme, content, sections, contact) has the issue.

function checkChunk(activeTabName) {
  // Let's create a minimal App component with just this tab's content and check if it parses.
  let tabStart = -1;
  let tabEnd = -1;
  
  if (activeTabName === "branding") {
     tabStart = 1159; // index in array
     tabEnd = 1282;
  } else if (activeTabName === "theme") {
     tabStart = 1283;
     tabEnd = 2631;
  } else if (activeTabName === "content") {
     tabStart = 2631;
     tabEnd = 2765;
  } else if (activeTabName === "contact") {
     tabStart = 2765;
     tabEnd = 3385;
  }

  if (tabStart === -1) return;

  const tabLines = lines.slice(tabStart, tabEnd);
  const testTemplate = `
    import React from 'react';
    export default function MockComponent() {
      const activeTab = "${activeTabName}";
      const siteConfig = { sections: [] } as any;
      const setSiteConfig = () => {};
      const taglineQuery = "";
      const setTaglineQuery = () => {};
      const taglineStyle = "";
      const setTaglineStyle = () => {};
      const generateAICopy = () => {};
      const aiLoading = {} as any;
      const backupFileInputRef = { current: null };
      const handleRestoreDefaults = () => {};
      const moveSection = () => {};
      const cleanAndFormatIndianNumber = () => {};
      const useSameNumber = false;
      const setUseSameNumber = () => {};
      const seoQuery = "";
      const setSeoQuery = () => {};
      const addHolidayClosure = () => {};
      const removeHolidayClosure = () => {};
      const updateHolidayClosure = () => {};
      const generateGalleryNarrative = () => {};
      const galleryNarrativeQuery = "";
      const setGalleryNarrativeQuery = () => {};
      const galleryNarrativeStyle = "";
      const setGalleryNarrativeStyle = () => {};
      const handleAddGalleryImage = () => {};
      const removeGalleryImage = () => {};
      const generateImageAltCaption = () => {};
      
      return (
        <div>
          ${tabLines.join('\n')}
        </div>
      );
    }
  `;

  try {
    parse(testTemplate, { sourceType: "module", plugins: ["jsx", "typescript"] });
    console.log(`Tab [${activeTabName}] PARSED PERFECTLY!`);
  } catch (err) {
    console.error(`Tab [${activeTabName}] FAILED to parse!`);
    console.error(`Babel Error: ${err.message}`);
    // Find absolute line number in App.tsx
    if (err.loc) {
       const relativeLine = err.loc.line;
       // Find the index of tabLines inside testTemplate
       const tmplLines = testTemplate.split('\n');
       const tabIndexInTmpl = tmplLines.findIndex(l => l.includes(tabLines[1]));
       if (tabIndexInTmpl !== -1) {
          const appLineNum = tabStart + (relativeLine - tabIndexInTmpl);
          console.log(`Approximate error line in App.tsx: ~${appLineNum}`);
       }
    }
  }
}

console.log("Checking all active tabs separately...");
checkChunk("branding");
checkChunk("theme");
checkChunk("content");
checkChunk("contact");
