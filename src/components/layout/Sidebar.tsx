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
            <li className={pathname === '/purchase-dashboard' ? 'active' : ''}>
              <Link href="/purchase-dashboard">
                <img src="/assets/img/icons/product.svg" alt="img" />
                <span> Purchase Dashboard</span>
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
              <a href="#" onClick={(e) => { e.preventDefault(); toggleSubmenu('Sales'); }} className={openSubmenu === 'Sales' ? 'subdrop' : ''}>
                <img src="/assets/img/icons/sales1.svg" alt="img" />
                <span> Sales</span> <span className="menu-arrow"></span>
              </a>
              <ul style={{ display: openSubmenu === 'Sales' ? 'block' : 'none' }}>
                <li><Link href="/sales" className={pathname === '/sales' ? 'active' : ''}>Sales List</Link></li>
                <li><Link href="/purchases" className={pathname === '/purchases' ? 'active' : ''}>Purchase List</Link></li>
                <li><Link href="/pos" className={pathname === '/pos' ? 'active' : ''}>POS</Link></li>
                <li><Link href="/sales/new" className={pathname === '/sales/new' ? 'active' : ''}>New Sales</Link></li>
                <li><Link href="/sales/returns" className={pathname === '/sales/returns' ? 'active' : ''}>Sales Return List</Link></li>
                <li><Link href="/sales/returns/new" className={pathname === '/sales/returns/new' ? 'active' : ''}>New Sales Return</Link></li>
              </ul>
            </li>

            <li className="submenu">
              <a href="#" onClick={(e) => { e.preventDefault(); toggleSubmenu('Expense'); }} className={openSubmenu === 'Expense' ? 'subdrop' : ''}>
                <img src="/assets/img/icons/expense1.svg" alt="img" />
                <span> Expense</span> <span className="menu-arrow"></span>
              </a>
              <ul style={{ display: openSubmenu === 'Expense' ? 'block' : 'none' }}>
                <li><Link href="/expenses" className={pathname === '/expenses' ? 'active' : ''}>Expense List</Link></li>
                <li><Link href="/expenses/category" className={pathname === '/expenses/category' ? 'active' : ''}>Expense Category</Link></li>
              </ul>
            </li>

            <li className="submenu">
              <a href="#" onClick={(e) => { e.preventDefault(); toggleSubmenu('People'); }} className={openSubmenu === 'People' ? 'subdrop' : ''}>
                <img src="/assets/img/icons/users1.svg" alt="img" />
                <span> People</span> <span className="menu-arrow"></span>
              </a>
              <ul style={{ display: openSubmenu === 'People' ? 'block' : 'none' }}>
                <li><Link href="/customers" className={pathname === '/customers' ? 'active' : ''}>Customer List</Link></li>
                <li><Link href="/customers/add" className={pathname === '/customers/add' ? 'active' : ''}>Add Customer</Link></li>
                <li><Link href="/suppliers" className={pathname === '/suppliers' ? 'active' : ''}>Supplier List</Link></li>
                <li><Link href="/loans" className={pathname === '/loans' ? 'active' : ''}>Ledger</Link></li>
                <li><Link href="/suppliers/add" className={pathname === '/suppliers/add' ? 'active' : ''}>Add Supplier</Link></li>
                <li><Link href="/employees" className={pathname === '/employees' ? 'active' : ''}>Employee List</Link></li>
                <li><Link href="/employees/add" className={pathname === '/employees/add' ? 'active' : ''}>Add Employee</Link></li>
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

            <li className="submenu">
              <a href="#" onClick={(e) => { e.preventDefault(); toggleSubmenu('Users'); }} className={openSubmenu === 'Users' ? 'subdrop' : ''}>
                <img src="/assets/img/icons/users1.svg" alt="img" />
                <span> Users</span> <span className="menu-arrow"></span>
              </a>
              <ul style={{ display: openSubmenu === 'Users' ? 'block' : 'none' }}>
                <li><a href="#">New User </a></li>
                <li><a href="#">Users List</a></li>
              </ul>
            </li>

            <li className="submenu">
              <a href="#" onClick={(e) => { e.preventDefault(); toggleSubmenu('Settings'); }} className={openSubmenu === 'Settings' ? 'subdrop' : ''}>
                <img src="/assets/img/icons/settings.svg" alt="img" />
                <span> Settings</span> <span className="menu-arrow"></span>
              </a>
              <ul style={{ display: openSubmenu === 'Settings' ? 'block' : 'none' }}>
                <li><Link href="/settings" className={pathname === '/settings' ? 'active' : ''}>General Settings</Link></li>
                <li><a href="#">Email Settings</a></li>
                <li><a href="#">Payment Settings</a></li>
                <li><a href="#">Currency Settings</a></li>
                <li><a href="#">Group Permissions</a></li>
                <li><a href="#">Tax Rates</a></li>
              </ul>
            </li>

          </ul>
        </div>
      </div>
    </div>
  );
}
