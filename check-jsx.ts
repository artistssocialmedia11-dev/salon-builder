import * as fs from 'fs';

const code = fs.readFileSync('src/App.tsx', 'utf8');

const stack: { name: string, line: number }[] = [];
const lines = code.split('\n');

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // A very naive regex to find opening tags and closing tags.
  // This will fail on <div /> or self closing or strings, but let's just try
  
  const opens = [...line.matchAll(/<([a-zA-Z0-9]+)[ \n>]/g)].filter(m => !line.includes('/>') || m[0].includes('>'));
  // We can't really parse JSX like this reliably.
}
