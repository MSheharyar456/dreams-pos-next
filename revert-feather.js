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

            // Revert double nested
            content = content.replace(/<span dangerouslySetInnerHTML=\{\{\s*__html:\s*'<span dangerouslySetInnerHTML=\{\{\s*__html:\s*'<i data-feather="([^"]+)"><\/i>'\s*\}\}\s*suppressHydrationWarning\s*\/>'\s*\}\}\s*suppressHydrationWarning\s*\/>/g, '<i data-feather="$1"></i>');
            
            // Revert double nested with class
            content = content.replace(/<span dangerouslySetInnerHTML=\{\{\s*__html:\s*'<span dangerouslySetInnerHTML=\{\{\s*__html:\s*'<i class="([^"]+)" data-feather="([^"]+)"><\/i>'\s*\}\}\s*suppressHydrationWarning\s*\/>'\s*\}\}\s*suppressHydrationWarning\s*\/>/g, '<i className="$1" data-feather="$2"></i>');

            // Revert single nested
            content = content.replace(/<span dangerouslySetInnerHTML=\{\{\s*__html:\s*'<i data-feather="([^"]+)"><\/i>'\s*\}\}\s*suppressHydrationWarning\s*\/>/g, '<i data-feather="$1"></i>');
            
            // Revert single nested with class
            content = content.replace(/<span dangerouslySetInnerHTML=\{\{\s*__html:\s*'<i class="([^"]+)" data-feather="([^"]+)"><\/i>'\s*\}\}\s*suppressHydrationWarning\s*\/>/g, '<i className="$1" data-feather="$2"></i>');

            if (content !== originalContent) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log('Reverted feather icons in:', fullPath);
            }
        }
    });
}

processDirectory(path.join(__dirname, 'src'));
console.log('Finished reverting feather icons.');
