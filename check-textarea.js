import fs from 'fs';

const code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /<\/?([a-zA-Z0-9]+)[^>]*>/g;
let match;
while ((match = regex.exec(code)) !== null) {
  let fullTag = match[0];
  if (fullTag.includes('textarea')) {
     console.log('TEXTAREA:', JSON.stringify(fullTag), 'Ends with "/>":', fullTag.endsWith('/>'));
  }
}
