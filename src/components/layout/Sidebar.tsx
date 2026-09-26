'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  const toggleSubmenu = (menu: string) => {
    setOpenSubmenu(openSubmenu === menu ? null : menu);
  };
  
  return (
    <div className="sidebar" id="sidebar">
      <div className="sidebar-inner" style={{ overflowY: 'auto', height: '100%' }}>
        <div id="sidebar-menu" className="sidebar-menu" style={{ paddingBottom: '100px' }}>
          <ul>
            <li className={pathname === '/dashboard' ? 'active' : ''}>
              <Link href="/dashboard">
                <img src="/assets/img/icons/dashboard.svg" alt="img" />
                <span> Dashboard</span>
              </Link>
            </li>
            <li className={pathname === '/sales' ? 'active' : ''}>
              <Link href="/sales">
                <img src="/assets/img/icons/sales1.svg" alt="img" />
                <span> Sales List</span>
              </Link>
            </li>

            <li className={pathname === '/expenses' ? 'active' : ''}>
              <Link href="/expenses">
                <img src="/assets/img/icons/expense1.svg" alt="img" />
                <span> Expense List</span>
              </Link>
            </li>

            <li className={pathname === '/customers' ? 'active' : ''}>
              <Link href="/customers">
                <img src="/assets/img/icons/users1.svg" alt="img" />
                <span> People</span>
              </Link>
            </li>

            <li className="submenu">
              <a href="#" onClick={(e) => { e.preventDefault(); toggleSubmenu('Product'); }} className={openSubmenu === 'Product' ? 'subdrop' : ''}>
                <img src="/assets/img/icons/product.svg" alt="img" />
                <span> Product</span> <span className="menu-arrow"></span>
              </a>
              <ul style={{ display: openSubmenu === 'Product' ? 'block' : 'none' }}>
                <li><Link href="/products" className={pathname === '/products' ? 'active' : ''}>Product List</Link></li>
                <li><Link href="/products/add" className={pathname === '/products/add' ? 'active' : ''}>Add Product</Link></li>
                <li><Link href="/categories" className={pathname === '/categories' ? 'active' : ''}>Category List</Link></li>
                <li><Link href="/categories/add" className={pathname === '/categories/add' ? 'active' : ''}>Add Category</Link></li>
                <li><Link href="/brands" className={pathname === '/brands' ? 'active' : ''}>Brand List</Link></li>
                <li><Link href="/brands/add" className={pathname === '/brands/add' ? 'active' : ''}>Add Brand</Link></li>
                <li><Link href="/units" className={pathname === '/units' ? 'active' : ''}>Unit List</Link></li>
                <li><Link href="/units/add" className={pathname === '/units/add' ? 'active' : ''}>Add Unit</Link></li>
              </ul>
            </li>

            <li className="submenu">
              <a href="#" onClick={(e) => { e.preventDefault(); toggleSubmenu('Report'); }} className={openSubmenu === 'Report' ? 'subdrop' : ''}>
                <img src="/assets/img/icons/time.svg" alt="img" />
                <span> Report</span> <span className="menu-arrow"></span>
              </a>
              <ul style={{ display: openSubmenu === 'Report' ? 'block' : 'none' }}>
                <li><Link href="/report/profit-loss" className={pathname === '/report/profit-loss' ? 'active' : ''}>Profit & Loss</Link></li>
                <li><Link href="/report/inventory" className={pathname === '/report/inventory' ? 'active' : ''}>Inventory Report</Link></li>
                <li><Link href="/report/sales" className={pathname === '/report/sales' ? 'active' : ''}>Sales Report</Link></li>
                <li><a href="#">Supplier Report</a></li>
                <li><a href="#">Customer Report</a></li>
              </ul>
            </li>

            <li className={pathname === '/settings' ? 'active' : ''}>
              <Link href="/settings">
                <img src="/assets/img/icons/settings.svg" alt="img" />
                <span> Settings</span>
              </Link>
            </li>

          </ul>
        </div>
      </div>
    </div>
  );
}
