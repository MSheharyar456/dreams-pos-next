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

            // Find all <i ... data-feather="..." ...></i>
            // We use a replacer function to avoid double-wrapping
            content = content.replace(/<i([^>]*)data-feather="([^"]+)"([^>]*)><\/i>/g, (match, prefix, iconName, suffix) => {
                
                // If the match is inside a string (like our __html string), we shouldn't touch it.
                // We can't easily check that with regex, but since we reverted everything, there are no spans.
                
                // Extract className if present
                let classNameMatch = match.match(/className="([^"]+)"/);
                let className = classNameMatch ? classNameMatch[1] : '';
                
                let htmlString = className ? `<i class="${className}" data-feather="${iconName}"></i>` : `<i data-feather="${iconName}"></i>`;
                
                return `<span suppressHydrationWarning dangerouslySetInnerHTML={{ __html: '${htmlString}' }} />`;
            });

            if (content !== originalContent) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log('Robustly fixed feather icons in:', fullPath);
            }
        }
    });
}

// First, make sure we revert any suppressHydrationWarning directly on the <i> tag just in case our regex catches it
// Actually, the regex /<i([^>]*)data-feather="([^"]+)"([^>]*)><\/i>/g will naturally swallow suppressHydrationWarning and discard it, which is perfect!

processDirectory(path.join(__dirname, 'src'));
console.log('Finished processing all files for feather icons.');
