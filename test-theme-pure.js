import fs from 'fs';
import { parse } from '@babel/parser';

const code = fs.readFileSync('src/App.tsx', 'utf8');
const lines = code.split('\n');

// Theme tab content starts at line 1285 (array index 1284)
// and ends at line 2628 (array index 2627)
const innerLines = lines.slice(1284, 2628);

const testTemplate = `
import React from 'react';
export default function ThemeTab() {
  const siteConfig = { sections: [], testimonials: [], doctors: [] } as any;
  const setSiteConfig = () => {};
  const query = "";
  const setQuery = () => {};
  const taglineQuery = "";
  const setTaglineQuery = () => {};
  const taglineStyle = "";
  const setTaglineStyle = () => {};
  const generateAICopy = () => {};
  const aiLoading = {} as any;
  const backupFileInputRef = { current: null };
  const handleRestoreDefaults = () => {};
  const moveSection = () => {};
  const isSelected = false;
  const preset = {} as any;
  const handleShareDraft = () => {};

  return (
    ${innerLines.join('\n')}
  );
}
`;

try {
  parse(testTemplate, { sourceType: "module", plugins: ["jsx", "typescript"] });
  console.log("THEME INNER CONTENT PARSED PERFECTLY!");
} catch (err) {
  console.error("THEME INNER CONTENT FAILED TO PARSE!");
  console.error(err.message);
  if (err.loc) {
    const tmplLines = testTemplate.split('\n');
    console.log("Error line in template:", err.loc.line);
    const relativeLine = err.loc.line - 22; // boilerplate lines
    console.log(`Error line in App.tsx: line ${1284 + relativeLine}`);
    
    // Print around error
    const start = Math.max(0, err.loc.line - 7);
    const end = Math.min(tmplLines.length, err.loc.line + 7);
    for (let i = start; i < end; i++) {
       const prefix = i + 1 === err.loc.line ? '=> ' : '   ';
       console.log(`${prefix}${String(i + 1).padStart(4)}: ${tmplLines[i]}`);
    }
  }
}
