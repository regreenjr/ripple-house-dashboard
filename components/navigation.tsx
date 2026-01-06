"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, Upload, Users, Database, ScrollText, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export function Navigation() {
  const pathname = usePathname();

  const links = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: BarChart3,
    }
  ];

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <div className="flex-shrink-0 flex items-center gap-2">
              <div className="h-10 w-10 bg-primary rounded flex items-center justify-center">
                <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 18c-3.87-1.05-7-5.26-7-10V8.3l7-3.5 7 3.5V10c0 4.74-3.13 8.95-7 10z" />
                  <path d="M9.5 11.5l1.5 1.5 4-4" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-gray-900">Ripplehaus</span>
                <span className="text-xs text-gray-500 -mt-1">Dashboard</span>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-1">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.path || (pathname === '/' && link.path === '/dashboard');

                return (
                  <Link key={link.path} href={link.path}>
                    <Button
                      variant={isActive ? 'default' : 'ghost'}
                      className={cn(
                        'gap-2',
                        isActive
                          ? 'bg-primary text-white hover:bg-primary/90'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {link.label}
                    </Button>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2">
              <p className="text-sm font-medium text-gray-700">admin@ripplehaus.com</p>
              <Badge
                variant="default"
                className="capitalize shrink-0 bg-gray-900 text-white"
              >
                Admin
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
