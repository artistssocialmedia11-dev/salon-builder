import fs from 'fs';
import { parse } from '@babel/parser';

const code = fs.readFileSync('src/App.tsx', 'utf8');
const lines = code.split('\n');

// Contact tab content starts at line 2767 (array index 2766)
// and ends at line 3384 (array index 3383)
const innerLines = lines.slice(2766, 3384);

const testTemplate = `
import React from 'react';
export default function ContactTab() {
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
  const activeTab = "contact";

  return (
    ${innerLines.join('\n')}
  );
}
`;

try {
  parse(testTemplate, { sourceType: "module", plugins: ["jsx", "typescript"] });
  console.log("CONTACT INNER CONTENT PARSED PERFECTLY!");
} catch (err) {
  console.error("CONTACT INNER CONTENT FAILED TO PARSE!");
  console.error(err.message);
  if (err.loc) {
    const tmplLines = testTemplate.split('\n');
    console.log("Error line in template:", err.loc.line);
    const relativeLine = err.loc.line - 40; // boilerplate lines
    console.log(`Error line in App.tsx: line ${2766 + relativeLine}`);
    
    // Print around error
    const start = Math.max(0, err.loc.line - 7);
    const end = Math.min(tmplLines.length, err.loc.line + 7);
    for (let i = start; i < end; i++) {
       const prefix = i + 1 === err.loc.line ? '=> ' : '   ';
       console.log(`${prefix}${String(i + 1).padStart(4)}: ${tmplLines[i]}`);
    }
  }
}
