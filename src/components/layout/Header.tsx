'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, MessageCircle, Menu, Heart, ShoppingBag, User as UserIcon } from 'lucide-react';
import { CONTACT_CONFIG, NAV_LINKS } from '@/lib/constants';
import { useAuth } from '@/context/AuthContext';
import { useSavedItems } from '@/context/SavedItemsContext';
import { MobileNav } from './MobileNav';

export const Header: React.FC = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { user, isAuthenticated, openLoginModal } = useAuth();
  const { wishlistIds, shortlistIds } = useSavedItems();

  return (
    <>
      <header
        id="top"
        className="sticky top-0 z-40 bg-cream-50/95 backdrop-blur-sm border-b border-gold-200/60 shadow-header transition-colors"
      >
        {/* Top Utility Bar */}
        <div className="bg-maroon-800 text-cream-100 text-xs py-1.5 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
            <div className="flex items-center gap-4">
              <span className="hidden sm:inline text-gold-200">
                ✨ 25+ Years of Trust &amp; Quality Craftsmanship
              </span>
              <span className="text-gold-200 font-medium">Gorakhpur Store</span>
            </div>
            <div className="flex items-center gap-4 font-sans">
              <span className="hidden md:inline text-cream-200/90">
                {CONTACT_CONFIG.hours}
              </span>
              <a
                href={`tel:${CONTACT_CONFIG.primaryPhoneRaw}`}
                className="flex items-center gap-1.5 text-gold-300 hover:text-white transition-colors"
                aria-label={`Call Store at ${CONTACT_CONFIG.primaryPhone}`}
              >
                <Phone className="w-3 h-3 text-gold-400" />
                <span>{CONTACT_CONFIG.primaryPhone}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Main Navigation Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 flex-shrink-0 group focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 rounded"
            aria-label="Khushi Ornament House Home"
          >
            <Image
              src="/assets/khushi-logo.png"
              alt="Khushi Ornament House Logo"
              width={160}
              height={50}
              priority
              className="h-10 sm:h-12 w-auto object-contain"
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
                className="px-3 py-1.5 rounded-lg hover:text-maroon-800 hover:bg-gold-100/70 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Action Icons & Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Wishlist Link & Counter */}
            <Link
              href="/wishlist"
              className="relative p-2 text-charcoal-700 hover:text-maroon-800 hover:bg-gold-100/60 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
              aria-label={`Wishlist with ${wishlistIds.length} items`}
            >
              <Heart className="w-5 h-5" />
              {wishlistIds.length > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-maroon-700 text-cream-50 text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                  {wishlistIds.length}
                </span>
              )}
            </Link>

            {/* Buying Shortlist Link & Counter */}
            <Link
              href="/shortlist"
              className="relative p-2 text-charcoal-700 hover:text-maroon-800 hover:bg-gold-100/60 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
              aria-label={`Buying Shortlist with ${shortlistIds.length} items`}
            >
              <ShoppingBag className="w-5 h-5" />
              {shortlistIds.length > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-gold-600 text-cream-50 text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                  {shortlistIds.length}
                </span>
              )}
            </Link>

            {/* User Account / Sign In Action */}
            {isAuthenticated && user ? (
              <Link
                href="/account"
                className="flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-1.5 bg-gold-100/80 hover:bg-gold-200/80 border border-gold-300 rounded-lg text-xs font-semibold text-maroon-900 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
                aria-label="View My Account"
              >
                <div className="w-6 h-6 rounded-full bg-maroon-800 text-cream-50 font-serif font-bold text-xs flex items-center justify-center flex-shrink-0">
                  {user.name.charAt(0)}
                </div>
                <span className="hidden sm:inline max-w-[100px] truncate">
                  {user.name.split(' ')[0]}
                </span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => openLoginModal()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cream-50 hover:bg-gold-100/80 border border-gold-300 rounded-lg text-xs font-semibold text-maroon-900 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
                aria-label="Sign In to Save"
              >
                <UserIcon className="w-4 h-4 text-gold-700" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}

            {/* WhatsApp Quick Action */}
            <a
              href={`https://wa.me/${CONTACT_CONFIG.whatsappNumberRaw}?text=${encodeURIComponent(
                'Hello Khushi Ornament House, I would like to inquire about your jewellery collections.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-sm transition-colors"
              aria-label="Inquire on WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>

            {/* Mobile Menu Hamburger */}
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="lg:hidden p-2 text-charcoal-800 hover:text-maroon-700 hover:bg-gold-50 rounded-lg"
              aria-label="Open Mobile Menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      <MobileNav
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />
    </>
  );
};
