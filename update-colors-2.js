const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Replace bg colors
  content = content.replace(/bg-\[\#0F172A\]/g, 'bg-primary text-primary-foreground');
  content = content.replace(/hover:bg-\[\#1E293B\]/g, 'hover:bg-primary/90');
  
  // StatsSection has text-[#0F172A] still?
  content = content.replace(/text-\[\#0F172A\]/g, 'text-primary');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      processFile(fullPath);
    }
  }
}

walkDir(path.join(__dirname, 'src'));
