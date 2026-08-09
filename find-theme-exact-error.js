import fs from 'fs';
import { parse } from '@babel/parser';

const code = fs.readFileSync('src/App.tsx', 'utf8');
const lines = code.split('\n');

const tabStart = 1283;
const tabEnd = 2629;
const tabLines = lines.slice(tabStart, tabEnd);

function stripBraces(str) {
  let chars = str.split('');
  let len = chars.length;
  let i = 0;
  while (i < len) {
    if (chars[i] === '{') {
      let depth = 1;
      let j = i + 1;
      let closed = false;
      while (j < len) {
        if (chars[j] === '"' || chars[j] === "'" || chars[j] === '`') {
          let quote = chars[j];
          j++;
          while (j < len && chars[j] !== quote) {
            if (chars[j] === '\\') j++;
            j++;
          }
          j++;
        } else if (chars[j] === '{') {
          depth++;
          j++;
        } else if (chars[j] === '}') {
          depth--;
          if (depth === 0) {
            closed = true;
            break;
          }
          j++;
        } else {
          j++;
        }
      }
      if (closed) {
        // Replace from i to j with spaces
        for (let k = i; k <= j; k++) {
          chars[k] = ' ';
        }
        i = j + 1;
      } else {
        i++;
      }
    } else {
      i++;
    }
  }
  return chars.join('');
}

function getOpenTags(slice) {
  let str = slice.join('\n');
  str = str.replace(/\/\*[\s\S]*?\*\//g, (match) => ' '.repeat(match.length));
  str = str.replace(/\/\/.*$/gm, (match) => ' '.repeat(match.length));
  str = stripBraces(str);
  
  const tagRegex = /<\/?[A-Za-z0-9_.-]+(?:\s+[^>]*?)?>/g;
  let match;
  let stack = [];
  while ((match = tagRegex.exec(str)) !== null) {
    const rawTag = match[0];
    if (rawTag.endsWith('/>')) continue;
    
    const matches = rawTag.match(/^<\/?([A-Za-z0-9_.-]+)/);
    if (!matches) continue;
    
    const tagName = matches[1];
    const isClosing = rawTag.startsWith('</');
    if (!isClosing) {
      stack.push(tagName);
    } else {
      if (stack.length > 0 && stack[stack.length - 1] === tagName) {
        stack.pop();
      }
    }
  }
  return stack;
}

for (let N = 1; N <= tabLines.length; N++) {
  const slice = tabLines.slice(0, N);
  
  // Count braces
  let braces = 0;
  let parens = 0;
  let str = slice.join('\n');
  str = str.replace(/\/\*[\s\S]*?\*\//g, '');
  str = str.replace(/\/\/.*$/gm, '');
  str = str.replace(/"(?:[^"\\]|\\.)*"/g, '""');
  str = str.replace(/'(?:[^'\\]|\\.)*'/g, "''");
  str = str.replace(/`(?:[^`\\]|\\.)*`/g, "``");
  
  for (let char of str) {
     if (char === '{') braces++;
     if (char === '}') braces--;
     if (char === '(') parens++;
     if (char === ')') parens--;
  }
  
  const openTags = getOpenTags(slice);
  
  let suffix = '';
  // Close JSX tags
  for (let j = openTags.length - 1; j >= 0; j--) {
     suffix += `</${openTags[j]}>`;
  }
  // Close Javascript braces
  if (parens > 0) {
    if (openTags.length === 0) {
      suffix += ' null' + ')'.repeat(parens);
    } else {
      suffix += ')'.repeat(parens);
    }
  }
  if (braces > 0) suffix += '}'.repeat(braces);
  
  const testCode = `
    import React from 'react';
    export default function Test() {
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
          ${slice.join('\n')}
          ${suffix}
        </div>
      );
    }
  `;
  
  try {
    parse(testCode, { sourceType: "module", plugins: ["jsx", "typescript"] });
  } catch (err) {
    console.log(`Bisection failed at N = ${N} (App.tsx line ${N + tabStart})`);
    console.log(`Error: ${err.message}`);
    console.log("Last 5 lines of slice:");
    for (let j = Math.max(0, N - 5); j < N; j++) {
       console.log(`  ${j + tabStart + 1}: ${tabLines[j]}`);
    }
    // Print the constructed suffix
    console.log("Constructed suffix:", suffix);
    break;
  }
}
console.log("Bisection completed!");
