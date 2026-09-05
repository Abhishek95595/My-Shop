'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Sparkles, Heart, ShoppingBag, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useSavedItems } from '@/context/SavedItemsContext';

export const MobileBottomNav: React.FC = () => {
  const pathname = usePathname();
  const { isAuthenticated, openLoginModal } = useAuth();
  const { wishlistProducts, shortlistProducts } = useSavedItems();

  const wishlistCount = wishlistProducts.length;
  const shortlistCount = shortlistProducts.length;

  const navItems = [
    {
      label: 'Home',
      href: '/',
      icon: Home,
      isActive: pathname === '/',
      badge: 0,
      onClick: undefined,
    },
    {
      label: 'Catalogue',
      href: '/catalogue',
      icon: Sparkles,
      isActive: pathname.startsWith('/catalogue'),
      badge: 0,
      onClick: undefined,
    },
    {
      label: 'Wishlist',
      href: '/wishlist',
      icon: Heart,
      isActive: pathname === '/wishlist',
      badge: wishlistCount,
      badgeColor: 'bg-maroon-700',
      onClick: undefined,
    },
    {
      label: 'Shortlist',
      href: '/shortlist',
      icon: ShoppingBag,
      isActive: pathname === '/shortlist',
      badge: shortlistCount,
      badgeColor: 'bg-gold-600',
      onClick: undefined,
    },
    {
      label: 'Account',
      href: '/account',
      icon: User,
      isActive: pathname === '/account',
      badge: 0,
      onClick: (e: React.MouseEvent) => {
        if (!isAuthenticated) {
          e.preventDefault();
          openLoginModal();
        }
      },
    },
  ];

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 inset-x-0 z-40 bg-cream-50/95 backdrop-blur-md border-t border-gold-200/80 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] md:hidden pb-[env(safe-area-inset-bottom,0px)] transition-all"
    >
      <div className="grid grid-cols-5 items-stretch h-14">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;

          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={item.onClick}
              aria-label={
                item.badge > 0
                  ? `${item.label} (${item.badge} items)`
                  : item.label
              }
              aria-current={active ? 'page' : undefined}
              className={`flex flex-col items-center justify-center min-h-[44px] py-1 px-1 text-center transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 rounded-lg select-none active:scale-95 ${
                active
                  ? 'text-maroon-900 font-bold'
                  : 'text-charcoal-500 hover:text-maroon-800 font-medium'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    active
                      ? 'text-maroon-800 scale-110'
                      : 'text-charcoal-500 group-hover:text-maroon-800'
                  }`}
                  aria-hidden="true"
                />
                {item.badge > 0 && (
                  <span
                    className={`absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 text-cream-50 text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs ${
                      item.badgeColor || 'bg-maroon-700'
                    }`}
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] tracking-tight mt-1 leading-none truncate max-w-full ${
                  active ? 'text-maroon-900 font-semibold' : 'text-charcoal-600'
                }`}
              >
                {item.label}
              </span>
              {active && (
                <span
                  className="w-1 h-1 bg-gold-600 rounded-full mt-0.5"
                  aria-hidden="true"
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
