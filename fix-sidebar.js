const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'components', 'layout', 'Sidebar.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add useState import if not present
if (!content.includes('useState')) {
    content = content.replace("import { usePathname } from \"next/navigation\";", "import { usePathname } from \"next/navigation\";\nimport { useState } from \"react\";");
}

// 2. Add state variable inside Sidebar component
if (!content.includes('const [openSubmenu, setOpenSubmenu] = useState')) {
    content = content.replace('const pathname = usePathname();', `const pathname = usePathname();\n  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);\n\n  const toggleSubmenu = (menu: string) => {\n    setOpenSubmenu(openSubmenu === menu ? null : menu);\n  };`);
}

// 3. Transform the submenus
// We need to match the a tag and the opening ul tag.
// Because formatting might vary, let's use a function replacer.

content = content.replace(/<li className="submenu">([\s\S]*?)<a\s+href="[^"]*">([\s\S]*?)<span>\s*([^<]+)<\/span>\s*<span className="menu-arrow"><\/span>\s*<\/a>\s*<ul>/g, (match, beforeA, insideA, menuText) => {
    
    const menuKey = menuText.trim();
    
    return `<li className="submenu">${beforeA}<a href="#" onClick={(e) => { e.preventDefault(); toggleSubmenu('${menuKey}'); }} className={openSubmenu === '${menuKey}' ? 'subdrop' : ''}>${insideA}<span> ${menuKey}</span> <span className="menu-arrow"></span>\n              </a>\n              <ul style={{ display: openSubmenu === '${menuKey}' ? 'block' : 'none' }}>`;
});

fs.writeFileSync(filePath, content, 'utf8');
console.log('Sidebar made fully functional with React state!');
