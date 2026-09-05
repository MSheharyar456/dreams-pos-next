const fs = require('fs');
const content = fs.readFileSync('public/assets/css/style.css', 'utf8');

const regex = /\.sidebar\s*\{([^}]+)\}/g;
let match;
while ((match = regex.exec(content)) !== null) {
    console.log('.sidebar {' + match[1] + '}');
}
