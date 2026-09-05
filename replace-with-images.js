const fs = require('fs');
const path = require('path');

const iconMap = {
    'layers': 'places.svg',
    'file': 'excel.svg',
    'alert-octagon': 'close-circle.svg',
    'user': 'users1.svg'
};

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.tsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let originalContent = content;

            // Revert the span wrapper
            content = content.replace(/<span suppressHydrationWarning dangerouslySetInnerHTML=\{\{\s*__html:\s*'<i class="([^"]*)" data-feather="([^"]+)"><\/i>'\s*\}\}\s*\/>/g, '<i className="$1" data-feather="$2"></i>');
            content = content.replace(/<span suppressHydrationWarning dangerouslySetInnerHTML=\{\{\s*__html:\s*'<i data-feather="([^"]+)"><\/i>'\s*\}\}\s*\/>/g, '<i data-feather="$1"></i>');

            // Now replace all <i data-feather="X"> with <img src="/assets/img/icons/Y.svg" />
            content = content.replace(/<i([^>]*)data-feather="([^"]+)"([^>]*)><\/i>/g, (match, prefix, iconName, suffix) => {
                let mappedIcon = iconMap[iconName] || 'dashboard.svg';
                
                // Extract className if present
                let classNameMatch = match.match(/className="([^"]+)"/);
                let className = classNameMatch ? classNameMatch[1] : '';
                
                let imgTag = className 
                    ? `<img src="/assets/img/icons/${mappedIcon}" className="${className}" alt="img" />`
                    : `<img src="/assets/img/icons/${mappedIcon}" alt="img" />`;
                return imgTag;
            });

            if (content !== originalContent) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log('Replaced with static images in:', fullPath);
            }
        }
    });
}

processDirectory(path.join(__dirname, 'src'));
console.log('Finished replacing feather icons with static images.');
