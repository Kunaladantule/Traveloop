const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Replace text color
  content = content.replace(/text-\[\#0F172A\]/g, 'text-primary');
  
  // Replace card border
  content = content.replace(/border-white\/80/g, 'border-border');
  
  // Update headings to use font-heading
  content = content.replace(/<h1(.*?)className="(.*?)"/g, '<h1$1className="$2 font-heading"');
  content = content.replace(/<h2(.*?)className="(.*?)"/g, '<h2$1className="$2 font-heading"');
  content = content.replace(/<h3(.*?)className="(.*?)"/g, '<h3$1className="$2 font-heading"');
  
  // Make stats semi-bold with strong contrast in StatsSection
  if (filePath.includes('StatsSection')) {
    content = content.replace(/font-extrabold text-primary mb-1/g, 'font-semibold text-primary mb-1 drop-shadow-sm');
  }

  // Update bg colors for section wrappers to bg-background or bg-secondary where appropriate
  // Features, Testimonials were bg-slate-50
  content = content.replace(/bg-slate-50/g, 'bg-background');
  
  // FAQ, HowItWorks were bg-white
  content = content.replace(/bg-white py-24/g, 'bg-background py-24');
  
  // Stats is bg-gradient-to-br from-[#fcf8d4] to-[#fdfbf0], let's keep it or change to secondary? User said Background: #F8FAFC. 
  // Let's change the StatsSection gradient to use accent or secondary to match the new palette.
  // Actually they didn't ask to remove the gradient, just defined "Background".
  
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
