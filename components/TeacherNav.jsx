'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function TeacherNav() {
  const pathname = usePathname();

  const navItems = [
    { href: '/teacher/dashboard', label: 'Dashboard', icon: '🏠' },
    { href: '/teacher/attendance', label: 'Attendance', icon: '📋' },
    { href: '/teacher/grades', label: 'Grades', icon: '📊' },
    { href: '/teacher/timetable', label: 'Timetable', icon: '📅' },
    { href: '/teacher/analytics', label: 'Analytics', icon: '📈' },
  ];

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex space-x-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

