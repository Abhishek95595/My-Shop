'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  X,
  Phone,
  MessageCircle,
  Heart,
  ShoppingBag,
  User as UserIcon,
  LogOut,
  Search,
} from 'lucide-react';
import { CONTACT_CONFIG, NAV_LINKS } from '@/lib/constants';
import { useAuth } from '@/context/AuthContext';
import { useSavedItems } from '@/context/SavedItemsContext';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onClose }) => {
  const [drawerSearch, setDrawerSearch] = useState('');
  const router = useRouter();

  const { user, isAuthenticated, openLoginModal, logout } = useAuth();
  const { wishlistProducts, shortlistProducts } = useSavedItems();
  const wishlistCount = wishlistProducts.length;
  const shortlistCount = shortlistProducts.length;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleDrawerSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = drawerSearch.trim();
    onClose();
    setDrawerSearch('');
    if (query) {
      router.push(`/catalogue?q=${encodeURIComponent(query)}`);
    } else {
      router.push('/catalogue');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Mobile Navigation"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-charcoal-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-cream-50 shadow-2xl flex flex-col justify-between overflow-y-auto border-l border-gold-200">
        {/* Top Header */}
        <div className="p-3 sm:p-4 border-b border-gold-200/80 flex items-center justify-between">
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 rounded"
            aria-label="Khushi Ornament House Home"
          >
            <Image
              src="/assets/khushi-logo.png"
              alt="Khushi Ornament House Logo"
              width={140}
              height={44}
              className="h-8 sm:h-9 w-auto object-contain"
            />
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-charcoal-700 hover:text-maroon-700 hover:bg-gold-100/60 active:scale-95 rounded-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Drawer Search Bar */}
        <div className="p-3 bg-cream-100/70 border-b border-gold-200/80">
          <form
            onSubmit={handleDrawerSearchSubmit}
            className="relative flex items-center w-full"
            role="search"
          >
            <Search
              className="w-4 h-4 text-gold-700 absolute left-3.5 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={drawerSearch}
              onChange={(e) => setDrawerSearch(e.target.value)}
              placeholder="Search catalogue..."
              className="w-full pl-9 pr-14 py-2.5 text-xs bg-white border border-gold-300 rounded-lg text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500 shadow-inner min-h-[44px]"
              aria-label="Search jewellery catalogue"
            />
            <button
              type="submit"
              className="absolute right-1 px-3 py-2 bg-maroon-800 hover:bg-maroon-900 active:scale-95 text-cream-50 text-xs font-semibold rounded-md transition-transform min-h-[36px] focus:outline-none focus-visible:ring-2 focus-visible:ring-maroon-700"
              aria-label="Submit catalogue search"
            >
              Go
            </button>
          </form>
        </div>

        {/* User Status Bar */}
        <div className="px-4 py-3 bg-cream-100/90 border-b border-gold-200/80">
          {isAuthenticated && user ? (
            <div className="flex items-center justify-between">
              <Link
                href="/account"
                onClick={onClose}
                className="flex items-center gap-2.5 min-h-[44px] py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 rounded"
                aria-label="Go to My Account"
              >
                <div className="w-8 h-8 rounded-full bg-maroon-800 text-cream-50 font-serif font-bold text-xs flex items-center justify-center">
                  {user.name.charAt(0)}
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-maroon-950 truncate max-w-[140px]">
                    {user.name}
                  </p>
                  <p className="text-[11px] text-charcoal-500 font-mono truncate max-w-[140px]">
                    {user.email}
                  </p>
                </div>
              </Link>
              <button
                type="button"
                onClick={() => {
                  logout();
                  onClose();
                }}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center text-charcoal-500 hover:text-maroon-800 active:scale-95 rounded-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
                aria-label="Sign out of account"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                onClose();
                openLoginModal();
              }}
              className="w-full min-h-[44px] flex items-center justify-center gap-2 py-2 px-3 bg-gold-100 hover:bg-gold-200 active:scale-[0.98] border border-gold-300 rounded-lg text-xs font-bold text-maroon-900 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
              aria-label="Sign In with Google"
            >
              <UserIcon className="w-4 h-4 text-gold-700" />
              <span>Sign In with Google</span>
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <div className="py-2 px-3 flex-1 space-y-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className="min-h-[44px] flex items-center px-4 py-2.5 rounded-lg text-sm font-medium text-charcoal-800 hover:bg-gold-100/70 hover:text-maroon-800 active:bg-gold-200/80 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
            >
              {link.label}
            </Link>
          ))}

          {/* Protected List Shortcuts */}
          <div className="pt-2 mt-2 border-t border-gold-200/60 space-y-1">
            <Link
              href="/wishlist"
              onClick={onClose}
              className="min-h-[44px] flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium text-charcoal-800 hover:bg-gold-100/70 hover:text-maroon-800 active:bg-gold-200/80 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
              aria-label={`Wishlist with ${wishlistCount} saved items`}
            >
              <div className="flex items-center gap-2.5">
                <Heart className="w-4 h-4 text-maroon-700" />
                <span>Wishlist</span>
              </div>
              {wishlistCount > 0 && (
                <span className="bg-maroon-700 text-cream-50 text-xs px-2 py-0.5 rounded-full font-bold">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link
              href="/shortlist"
              onClick={onClose}
              className="min-h-[44px] flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium text-charcoal-800 hover:bg-gold-100/70 hover:text-maroon-800 active:bg-gold-200/80 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
              aria-label={`Buying Shortlist with ${shortlistCount} items`}
            >
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-4 h-4 text-gold-700" />
                <span>Buying Shortlist</span>
              </div>
              {shortlistCount > 0 && (
                <span className="bg-gold-600 text-cream-50 text-xs px-2 py-0.5 rounded-full font-bold">
                  {shortlistCount}
                </span>
              )}
            </Link>

            {isAuthenticated && (
              <Link
                href="/account"
                onClick={onClose}
                className="min-h-[44px] flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-medium text-charcoal-800 hover:bg-gold-100/70 hover:text-maroon-800 active:bg-gold-200/80 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
                aria-label="View My Account"
              >
                <UserIcon className="w-4 h-4 text-charcoal-600" />
                <span>My Account</span>
              </Link>
            )}
          </div>
        </div>

        {/* Bottom Contact Actions */}
        <div className="p-4 border-t border-gold-200/80 bg-cream-100 space-y-2.5">
          <a
            href={`https://wa.me/${CONTACT_CONFIG.whatsappNumberRaw}?text=${encodeURIComponent(
              'Hello Khushi Ornament House, I would like to inquire about your jewellery collections.'
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full min-h-[44px] flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.98] text-white py-2.5 px-4 rounded-lg font-semibold text-xs shadow-xs transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            aria-label="Send WhatsApp Enquiry"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp Enquiry</span>
          </a>

          <a
            href={`tel:${CONTACT_CONFIG.primaryPhoneRaw}`}
            className="w-full min-h-[44px] flex items-center justify-center gap-2 bg-maroon-700 hover:bg-maroon-800 active:scale-[0.98] text-cream-50 py-2.5 px-4 rounded-lg font-semibold text-xs shadow-xs transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-maroon-500"
            aria-label={`Call Store at ${CONTACT_CONFIG.primaryPhone}`}
          >
            <Phone className="w-4 h-4 text-gold-300" />
            <span>Call: {CONTACT_CONFIG.primaryPhone}</span>
          </a>
        </div>
      </div>
    </div>
  );
};
