const fs = require('fs');
const path = require('path');

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.tsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let originalContent = content;

            // Inject suppressHydrationWarning into the <i> tags
            content = content.replace(/<i\s+data-feather="([^"]+)">\s*<\/i>/g, '<i data-feather="$1" suppressHydrationWarning></i>');
            content = content.replace(/<i\s+className="([^"]+)"\s+data-feather="([^"]+)">\s*<\/i>/g, '<i className="$1" data-feather="$2" suppressHydrationWarning></i>');
            content = content.replace(/<i\s+data-feather="([^"]+)"\s+className="([^"]+)">\s*<\/i>/g, '<i data-feather="$1" className="$2" suppressHydrationWarning></i>');

            if (content !== originalContent) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log('Fixed feather icons cleanly in:', fullPath);
            }
        }
    });
}

processDirectory(path.join(__dirname, 'src'));
console.log('Finished processing all files for feather icons.');
