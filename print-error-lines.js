import fs from 'fs';
import { parse } from '@babel/parser';

const code = fs.readFileSync('src/App.tsx', 'utf8');
const lines = code.split('\n');

const tabStart = 1283;
const tabEnd = 2631;
const tabLines = lines.slice(tabStart, tabEnd);

const testTemplate = `
import React from 'react';
export default function MockComponent() {
  const activeTab = "theme";
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
} catch (err) {
  const tmplLines = testTemplate.split('\n');
  console.log("Error at line:", err.loc.line, "col:", err.loc.column);
  console.log("ErrorMessage:", err.message);
  
  const start = Math.max(0, err.loc.line - 15);
  const end = Math.min(tmplLines.length, err.loc.line + 15);
  for (let i = start; i < end; i++) {
     const prefix = i + 1 === err.loc.line ? '=> ' : '   ';
     console.log(`${prefix}${String(i + 1).padStart(4)}: ${tmplLines[i]}`);
  }
}
