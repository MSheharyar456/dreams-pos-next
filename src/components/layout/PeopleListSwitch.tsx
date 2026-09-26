import Link from 'next/link';

const lists = [
  { href: '/customers', label: 'Customer', icon: 'fa-user' },
  { href: '/suppliers', label: 'Supplier', icon: 'fa-truck' },
  { href: '/employees', label: 'Employee', icon: 'fa-users' },
] as const;

export default function PeopleListSwitch({ active }: { active: (typeof lists)[number]['href'] }) {
  return (
    <div className="btn-group shadow-sm" role="group" aria-label="Choose people list">
      {lists.map((list) => {
        const isActive = list.href === active;
        return (
          <Link
            key={list.href}
            href={list.href}
            aria-current={isActive ? 'page' : undefined}
            className={`btn fw-semibold px-3 ${isActive ? 'btn-warning text-white' : 'btn-outline-secondary'}`}
          >
            <i className={`fa ${list.icon} me-2`} aria-hidden="true"></i>{list.label}
          </Link>
        );
      })}
    </div>
  );
}
