const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'app', '(dashboard)', 'dashboard', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace all instances of <span className="counters" or similar with suppressHydrationWarning
content = content.replace(/<span\s+className="counters"/g, '<span suppressHydrationWarning className="counters"');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Counters fixed in Dashboard page.');
