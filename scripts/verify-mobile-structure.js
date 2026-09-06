/**
 * KOH Mobile-First Structural Smoke Test
 *
 * SCOPE & LIMITATIONS NOTICE:
 * This script is a source-level structural smoke test designed to catch obvious
 * implementation regressions prior to release.
 *
 * It validates:
 * - Presence of mobile-only (`md:hidden`, `lg:hidden`) and desktop-only (`hidden md:block`, `hidden lg:flex`) branches
 * - Separation of mobile product cards vs. desktop tables
 * - Mobile navigation and action bar positioning above bottom navigation
 * - Safe area inset token handling for notched devices
 * - 44px touch target design tokens
 * - Mandatory offline jewellery business rules (exact weight disclaimer, standardized contact links, product URL in WhatsApp)
 *
 * It does NOT validate:
 * - Actual browser runtime viewport rendering at 360px–430px
 * - Absence of runtime horizontal overflow
 * - Real rendered element dimensions
 * - Pixel-perfect visual alignment or text clipping
 * - Dynamic font rendering or live viewport overflow
 * - Real-device UX
 * Real responsive UX and browser rendering require Playwright or real device testing.
 */

const fs = require('fs');
const path = require('path');

console.log('==============================================================');
console.log('  Khushi Ornament House (KOH) - Mobile Structural Smoke Test  ');
console.log('  [Scope: Source-level structural verification only]          ');
console.log('==============================================================\n');

// Portable repository resolution
const projectRoot = path.resolve(__dirname, '..');
const srcDir = path.join(projectRoot, 'src');

if (!fs.existsSync(srcDir)) {
  console.error(`❌ Unable to locate KOH src directory: ${srcDir}`);
  process.exit(1);
}

function readSource(relativePath) {
  const filePath = path.join(srcDir, relativePath);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Missing required source file: ${relativePath} (path: ${filePath})`);
    process.exit(1);
  }
  return fs.readFileSync(filePath, 'utf8');
}

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ [FAIL] ${message}`);
    failed++;
  } else {
    console.log(`✅ [PASS] ${message}`);
    passed++;
  }
}

// ---------------------------------------------------------------------------
// 1. Mobile Bottom Navigation
// ---------------------------------------------------------------------------
console.log('--- 1. Mobile Bottom Navigation ---');
const bottomNavFile = readSource('components/layout/MobileBottomNav.tsx');

assert(
  bottomNavFile.includes('md:hidden'),
  'MobileBottomNav is hidden on desktop (md:hidden)'
);
assert(
  bottomNavFile.includes('fixed') && bottomNavFile.includes('bottom-0'),
  'MobileBottomNav is fixed at the bottom viewport edge'
);
assert(
  bottomNavFile.includes('safe-area-inset-bottom'),
  'MobileBottomNav handles iOS safe area inset padding'
);
assert(
  bottomNavFile.includes('grid-cols-5'),
  'MobileBottomNav defines 5 navigation destinations'
);
assert(
  bottomNavFile.includes('min-h-[44px]'),
  'MobileBottomNav items provide minimum 44px touch target height'
);

// ---------------------------------------------------------------------------
// 2. Floating WhatsApp Overlap Prevention
// ---------------------------------------------------------------------------
console.log('\n--- 2. Floating WhatsApp Overlap Prevention ---');
const floatingWaFile = readSource('components/layout/FloatingWhatsApp.tsx');

assert(
  floatingWaFile.includes('hidden md:block'),
  'FloatingWhatsApp hidden on mobile where required (e.g. product detail)'
);
assert(
  floatingWaFile.includes('bottom-6'),
  'FloatingWhatsApp keeps desktop bottom spacing'
);
assert(
  floatingWaFile.includes('4.5rem') && floatingWaFile.includes('safe-area-inset-bottom'),
  'FloatingWhatsApp is raised on mobile to clear bottom nav and respects safe area'
);

// ---------------------------------------------------------------------------
// 3. Product Detail Sticky Action Bar & Page Clearance
// ---------------------------------------------------------------------------
console.log('\n--- 3. Product Detail Sticky Action Bar & Page Clearance ---');
const productActionsFile = readSource('components/products/ProductDetailActions.tsx');

assert(
  productActionsFile.includes('md:hidden'),
  'Product sticky action bar is hidden on desktop'
);
assert(
  productActionsFile.includes('3.5rem') && productActionsFile.includes('safe-area-inset-bottom'),
  'Product sticky action bar clears the 3.5rem mobile bottom navigation with safe area inset'
);
assert(
  productActionsFile.includes('tel:+${CONTACT_CONFIG.primaryPhoneRaw}'),
  'Product detail actions use standardized international tel link'
);

const productResolverFile = readSource('components/products/ClientProductDetailResolver.tsx');
assert(
  productResolverFile.includes('9rem') && productResolverFile.includes('safe-area-inset-bottom'),
  'Product detail container has bottom padding to prevent content clipping by dual sticky bars'
);
assert(
  productResolverFile.includes('md:pb-0'),
  'Product detail container resets bottom padding on desktop'
);

// ---------------------------------------------------------------------------
// 4. Mobile 2-Card Grids (Catalogue, Wishlist, Shortlist)
// ---------------------------------------------------------------------------
console.log('\n--- 4. Mobile 2-Card Grids ---');
const catalogueFile = readSource('app/catalogue/page.tsx');
assert(
  catalogueFile.includes('grid-cols-2'),
  'Catalogue renders 2 columns on mobile viewports'
);
assert(
  catalogueFile.includes('md:grid-cols-3') || catalogueFile.includes('lg:grid-cols-4'),
  'Catalogue expands columns on tablet and desktop'
);

const wishlistFile = readSource('app/wishlist/page.tsx');
assert(
  wishlistFile.includes('grid-cols-2'),
  'Wishlist renders 2 columns on mobile viewports'
);
assert(
  wishlistFile.includes('lg:grid-cols-3') || wishlistFile.includes('sm:grid-cols-2'),
  'Wishlist expands columns on larger screens'
);

const shortlistFile = readSource('app/shortlist/page.tsx');
assert(
  shortlistFile.includes('grid-cols-2'),
  'Shortlist renders 2 columns on mobile viewports'
);
assert(
  shortlistFile.includes('lg:grid-cols-3') || shortlistFile.includes('sm:grid-cols-2'),
  'Shortlist expands columns on larger screens'
);

// ---------------------------------------------------------------------------
// 5. ProductCard WhatsApp Link Specifications
// ---------------------------------------------------------------------------
console.log('\n--- 5. ProductCard Enquiry Specifications ---');
const productCardFile = readSource('components/products/ProductCard.tsx');
assert(
  productCardFile.includes('productUrl'),
  'ProductCard includes canonical productUrl reference'
);
assert(
  productCardFile.includes('${product.name}'),
  'ProductCard WhatsApp message includes product name'
);
assert(
  productCardFile.includes('${product.sku}'),
  'ProductCard WhatsApp message includes product SKU'
);

// ---------------------------------------------------------------------------
// 6. Admin Mobile Layout (Dedicated Cards vs Desktop Tables)
// ---------------------------------------------------------------------------
console.log('\n--- 6. Admin Responsive Structural Layout ---');
const adminPageFile = readSource('app/admin/page.tsx');
assert(
  adminPageFile.includes('md:hidden'),
  'Admin products has mobile-only rendering'
);
assert(
  adminPageFile.includes('hidden md:block'),
  'Admin products desktop table is hidden on mobile'
);

const adminRatesFile = readSource('components/admin/AdminRatesManager.tsx');
assert(
  adminRatesFile.includes('md:hidden'),
  'Admin rates has mobile-only cards rendering'
);
assert(
  adminRatesFile.includes('hidden md:block'),
  'Admin rates desktop table is hidden on mobile'
);
assert(
  adminRatesFile.includes('grid-cols-2'),
  'Admin rates metrics and inputs fit 2 columns on mobile'
);

const adminEnquiriesFile = readSource('components/admin/AdminEnquiriesManager.tsx');
assert(
  adminEnquiriesFile.includes('md:hidden'),
  'Admin enquiries has mobile-only rendering'
);
assert(
  adminEnquiriesFile.includes('hidden md:block'),
  'Admin enquiries desktop table is hidden on mobile'
);

// ---------------------------------------------------------------------------
// 7. Header, Navigation & Root Layout Clearance
// ---------------------------------------------------------------------------
console.log('\n--- 7. Header & Root Layout Responsiveness ---');
const headerFile = readSource('components/layout/Header.tsx');
assert(
  headerFile.includes('lg:hidden'),
  'Header has dedicated mobile navigation trigger'
);
assert(
  headerFile.includes('hidden md:flex') || headerFile.includes('hidden lg:flex'),
  'Header hides desktop navigation links on smaller screens'
);

const layoutFile = readSource('app/layout.tsx');
assert(
  layoutFile.includes('4.5rem') && layoutFile.includes('safe-area-inset-bottom'),
  'Root layout main content area preserves bottom clearance for mobile nav and safe area'
);
assert(
  layoutFile.includes('md:pb-0'),
  'Root layout main content area resets bottom padding on desktop'
);

// ---------------------------------------------------------------------------
// 8. Jewellery Catalogue Business Rules & Disclaimers
// ---------------------------------------------------------------------------
console.log('\n--- 8. Approved Jewellery Scope & Disclaimer ---');
const constantsFile = readSource('lib/constants.ts');
assert(
  constantsFile.includes('Approximate weight shown. Actual weight may vary depending on size and design.'),
  'Constants contains the exact approved weight disclaimer'
);

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
console.log('\n==============================================================');
console.log(`Smoke Test Results: ${passed} passed, ${failed} failed`);
console.log('==============================================================');

if (failed > 0) {
  console.error(`\n❌ Structural smoke test encountered ${failed} failure(s).`);
  process.exit(1);
} else {
  console.log('\n🎉 ALL STRUCTURAL MOBILE ASSERTIONS PASSED SUCCESSFULLY!');
  process.exit(0);
}
