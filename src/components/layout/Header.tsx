'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Phone,
  MessageCircle,
  Menu,
  Heart,
  ShoppingBag,
  User as UserIcon,
  Search,
  X,
} from 'lucide-react';
import { CONTACT_CONFIG, NAV_LINKS } from '@/lib/constants';
import { useAuth } from '@/context/AuthContext';
import { useSavedItems } from '@/context/SavedItemsContext';
import { MobileNav } from './MobileNav';

export const Header: React.FC = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const { user, isAuthenticated, openLoginModal } = useAuth();
  const { wishlistProducts, shortlistProducts } = useSavedItems();
  const wishlistCount = wishlistProducts.length;
  const shortlistCount = shortlistProducts.length;

  useEffect(() => {
    if (isSearchOpen) {
      searchInputRef.current?.focus();
    }
  }, [isSearchOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    setIsSearchOpen(false);
    if (query) {
      router.push(`/catalogue?q=${encodeURIComponent(query)}`);
    } else {
      router.push('/catalogue');
    }
  };

  return (
    <>
      <header
        id="top"
        className="sticky top-0 z-40 bg-cream-50/95 backdrop-blur-md border-b border-gold-200/80 shadow-header transition-colors"
      >
        {/* Top Utility Bar - Hidden on mobile (under md) to eliminate vertical waste on phones */}
        <div className="hidden md:block bg-maroon-800 text-cream-100 text-xs py-1.5 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
            <div className="flex items-center gap-4">
              <span className="text-gold-200">✨ 25+ Years of Trust</span>
              <span className="text-gold-200 font-medium">Gorakhpur Store</span>
            </div>
            <div className="flex items-center gap-4 font-sans">
              <span className="text-cream-200/90">{CONTACT_CONFIG.hours}</span>
              <a
                href={`tel:${CONTACT_CONFIG.primaryPhoneRaw}`}
                className="flex items-center gap-1.5 text-gold-300 hover:text-white transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-gold-300 rounded px-1"
                aria-label={`Call Store at ${CONTACT_CONFIG.primaryPhone}`}
              >
                <Phone className="w-3 h-3 text-gold-400" />
                <span>{CONTACT_CONFIG.primaryPhone}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Main Navigation Bar */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 md:py-3 flex items-center justify-between gap-2 sm:gap-4">
          {/* Brand Logo - Compact on mobile (h-8), natural on desktop */}
          <Link
            href="/"
            className="flex items-center gap-2 flex-shrink-0 group focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 rounded-md active:opacity-85 transition-opacity"
            aria-label="Khushi Ornament House Home"
          >
            <Image
              src="/assets/khushi-logo.png"
              alt="Khushi Ornament House Logo"
              width={150}
              height={46}
              priority
              className="h-8 sm:h-10 md:h-12 w-auto object-contain transition-all"
            />
          </Link>

          {/* Desktop Navigation Links */}
          <nav
            className="hidden lg:flex items-center gap-1 xl:gap-2 text-sm font-medium text-charcoal-800"
            aria-label="Main Navigation"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-1.5 rounded-lg hover:text-maroon-800 hover:bg-gold-100/70 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Action Icons & Controls - Touch targets strictly >= 44x44px */}
          <div className="flex items-center gap-0.5 sm:gap-1.5">
            {/* Search Toggle Button */}
            <button
              type="button"
              onClick={() => setIsSearchOpen((prev) => !prev)}
              className={`min-w-[44px] min-h-[44px] flex items-center justify-center p-2 rounded-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 active:scale-95 ${
                isSearchOpen
                  ? 'bg-gold-200/80 text-maroon-900'
                  : 'text-charcoal-700 hover:text-maroon-800 hover:bg-gold-100/60'
              }`}
              aria-label={isSearchOpen ? 'Close search bar' : 'Search catalogue'}
              aria-expanded={isSearchOpen}
            >
              {isSearchOpen ? (
                <X className="w-5 h-5 text-maroon-800" />
              ) : (
                <Search className="w-5 h-5" />
              )}
            </button>

            {/* Wishlist Link & Counter */}
            <Link
              href="/wishlist"
              className="relative min-w-[44px] min-h-[44px] flex items-center justify-center p-2 text-charcoal-700 hover:text-maroon-800 hover:bg-gold-100/60 active:scale-95 rounded-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
              aria-label={`Wishlist with ${wishlistCount} saved items`}
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-maroon-700 text-cream-50 text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Buying Shortlist Link & Counter */}
            <Link
              href="/shortlist"
              className="relative min-w-[44px] min-h-[44px] flex items-center justify-center p-2 text-charcoal-700 hover:text-maroon-800 hover:bg-gold-100/60 active:scale-95 rounded-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
              aria-label={`Buying Shortlist with ${shortlistCount} items`}
            >
              <ShoppingBag className="w-5 h-5" />
              {shortlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-gold-600 text-cream-50 text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                  {shortlistCount}
                </span>
              )}
            </Link>

            {/* User Account / Sign In Action - Desktop & Tablet only in header, phone uses drawer */}
            <div className="hidden md:flex items-center">
              {isAuthenticated && user ? (
                <Link
                  href="/account"
                  className="min-h-[44px] flex items-center gap-1.5 px-3 py-1.5 bg-gold-100/80 hover:bg-gold-200/80 border border-gold-300 rounded-lg text-xs font-semibold text-maroon-900 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 active:scale-95"
                  aria-label="View My Account"
                >
                  <div className="w-6 h-6 rounded-full bg-maroon-800 text-cream-50 font-serif font-bold text-xs flex items-center justify-center flex-shrink-0">
                    {user.name.charAt(0)}
                  </div>
                  <span className="max-w-[100px] truncate">
                    {user.name.split(' ')[0]}
                  </span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => openLoginModal()}
                  className="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-1.5 bg-cream-50 hover:bg-gold-100/80 border border-gold-300 rounded-lg text-xs font-semibold text-maroon-900 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 active:scale-95"
                  aria-label="Sign In with Google"
                >
                  <UserIcon className="w-4 h-4 text-gold-700" />
                  <span>Sign In</span>
                </button>
              )}
            </div>

            {/* WhatsApp Quick Action - Desktop only */}
            <a
              href={`https://wa.me/${CONTACT_CONFIG.whatsappNumberRaw}?text=${encodeURIComponent(
                'Hello Khushi Ornament House, I would like to inquire about your jewellery collections.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-flex min-h-[44px] items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-xs transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              aria-label="Inquire on WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>

            {/* Mobile Menu Hamburger - Accessible min 44x44px touch target */}
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center p-2 text-charcoal-800 hover:text-maroon-700 hover:bg-gold-100/60 active:scale-95 rounded-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
              aria-label="Open navigation menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Expandable Mobile & Desktop Quick Search Bar */}
        {isSearchOpen && (
          <div className="px-3 sm:px-6 pb-3 pt-1 border-t border-gold-200/60 bg-cream-50/95 animate-in fade-in slide-in-from-top-1 duration-200">
            <form
              onSubmit={handleSearchSubmit}
              className="max-w-3xl mx-auto relative flex items-center w-full"
              role="search"
            >
              <Search
                className="w-4 h-4 text-gold-700 absolute left-3.5 pointer-events-none"
                aria-hidden="true"
              />
              <input
                ref={searchInputRef}
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search gold rings, necklaces, chains, bangles..."
                className="w-full pl-10 pr-24 py-2.5 text-xs sm:text-sm bg-white border border-gold-300 rounded-full text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500 shadow-inner"
                aria-label="Search jewellery catalogue"
              />
              <div className="absolute right-1.5 flex items-center gap-1">
                {searchQuery.trim() && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="w-8 h-8 flex items-center justify-center text-charcoal-400 hover:text-charcoal-700 active:scale-95 rounded-full focus:outline-none focus-visible:ring-1 focus-visible:ring-gold-500"
                    aria-label="Clear search input"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-maroon-800 hover:bg-maroon-900 active:scale-95 text-cream-50 text-xs font-semibold rounded-full shadow-xs transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-maroon-700"
                  aria-label="Submit search"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        )}
      </header>

      {/* Mobile Drawer Navigation */}
      <MobileNav
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />
    </>
  );
};
