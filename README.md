# Khushi Ornament House — Web Platform

Official web showcase and customer consultation application for **Khushi Ornament House**, located in Urdu Bazar, Gorakhpur, Uttar Pradesh. Operating with **25+ Years of Trust** under store proprietor **Dilip Kumar Verma**.

---

## 1. Project Overview

This platform is a showcase catalogue and customer inquiry application designed to:
- Showcase handcrafted gold jewellery (18K, 22K, and 24K purities).
- Facilitate bespoke custom order inquiries and physical showroom consultations.
- Support personal customer Wishlists and Buying Shortlists with local mock authentication.
- Enable approved mock administrators to manage catalogue products, customer inquiries, and owner-entered reference rates.

---

## 2. Technology Stack

- **Framework**: [Next.js 16.3.3](https://nextjs.org/) App Router (Turbopack development server; webpack production build for host compatibility)
- **Core**: React 19, TypeScript 5
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with custom luxury theme tokens (Ivory/Cream, Maroon, Restrained Gold)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Local Persistence**: Browser `localStorage` and `IndexedDB` (`KOH_ImageDB`)
- **Node Requirement**: **Node.js 24+**

---

## 3. Installation & Getting Started

### Prerequisites
Ensure Node.js 24+ is installed:
```bash
node -v # Should be v24.x.x
```

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
# Starts local development server on http://localhost:3000
```

### Production Build & Validation
```bash
npm run build
npm run lint
```

---

## 4. Key Features & Capabilities

### A. Public Catalogue & Jewellery Details
- **Gold-Only Digital Scope**: Rings, Necklaces/Sets, Chains, Mangalsutra, Bangles/Kada.
- **Purities**: 18K, 22K (916 Standard), 24K Fine Gold.
- **Filtering & Search**: Live multi-criteria filter by Category, Gender, Purity, Availability, Occasion, and Gram Weight.
- **Dynamic Product Details**: Multi-image showcase gallery, specifications table, and weight disclaimer.

### B. Mock Google-Style Authentication & Saved Items
- **Mock Google Sign-In**: Lightweight, passwordless demonstration sign-in requiring a valid Gmail address ending in `@gmail.com`.
- **Deterministic Customer ID**: Collisions-free encoding (`mock-user-gmail-${encodeURIComponent(email)}`).
- **Wishlist & Shortlist**: Isolated per customer profile in local browser storage.

### C. Contact & Customer Inquiries
- **Showroom Inquiries Form**: Collects customer name, validated 10-digit Indian mobile number, jewellery category, and message.
- **WhatsApp Integration**: Saves inquiry locally and prepares a prefilled WhatsApp message to primary showroom contact (`+91 8853665166`).
- **Anti-Spam / Rate Limiting**: Client-side double-submission prevention (server-side verification planned for production).

### D. Owner Admin Dashboard (`/admin`)
- **Authorized Store Owner Allowlist**:
  - `100abhisheksarraf@gmail.com`
  - `100dilipsarraf@gmail.com`
- **Product Management**: Create, Edit, Publish, Set Draft, Archive, Restore, and Toggle Featured.
- **Automatic Immutable SKU**: Sequentially generated (`KOH-GLD-{CODE}-{SEQ}`) and immutable upon creation.
- **Local Image Management (IndexedDB)**: 3–5 image slots per product, drag-and-drop, primary cover flag, alt-text input, and ephemeral Object URL lifecycle management.
- **Enquiry Management**: View customer inquiries, search/filter by status (`new`, `contacted`, `closed`), and update status.
- **Owner Reference Rates Manager**: Manually enter and update gold/bullion reference rates (hidden when empty; labeled "Owner-Updated Current Rates" with store confirmation disclaimer).

### E. Informational & Legal Pages
- `/about`: 25+ Years of Trust, store proprietor Dilip Kumar Verma, GSTIN `09AJBPV9683Q1ZW`.
- `/services`: 6 approved services with gold-only digital catalogue scope notice.
- `/custom-jewellery`: 4-step custom manufacturing and consultation workflow.
- `/old-gold-exchange`: Explains in-store physical inspection policy (no automated valuation calculators).
- `/faq`: Comprehensive answers covering gold scope, weights, made-on-order, and store visits.
- `/offers`: Live announcements (shows "No active offers currently" when empty).
- `/rates`: Owner-updated rates with confirmation notice (shows "Rates are currently unavailable" when empty).
- `/privacy`: Draft privacy policy accurately describing local browser storage and absence of external tracking.
- `/terms`: Draft terms outlining catalogue inquiry nature and offline physical transactions.

---

## 5. Mock Storage Architecture & Boundaries

1. **Local Storage**:
   - `koh_mock_auth_session`: Active mock session.
   - `koh_saved_wishlist_mock-user-*`: Customer wishlist items.
   - `koh_saved_shortlist_mock-user-*`: Customer buying shortlist items.
   - `koh_admin_custom_products`: Locally created custom catalogue products.
   - `koh_admin_sample_overrides`: Local edits to baseline sample products.
   - `koh_customer_enquiries`: Saved customer contact inquiries.
   - `koh_owner_rates`: Owner-entered bullion reference rates.
2. **IndexedDB (`KOH_ImageDB`)**:
   - `product_images`: Raw image blobs for admin-uploaded product images (JPG/PNG/WEBP ≤ 5MB).
3. **No External Backends Connected**:
   - Firebase and Firestore are **intentionally not configured**.
   - Cloudinary, Gmail API, and real Google OAuth SDK are **not connected**.
   - Payment gateways, cart checkouts, and shipping delivery systems are **strictly excluded**.
   - Hosting, deployment, and a purchased production domain are **not configured**.

---

## 6. How to Clear Local Demo Data

To reset all local test data (custom products, enquiries, saved wishlists, and IndexedDB images):
1. In your browser DevTools, go to **Application > Storage**.
2. Click **Clear site data** (clears LocalStorage and IndexedDB).
3. **Sign Out** clears only the active mock session. It does not erase saved lists, catalogue data, enquiries, rates, or IndexedDB images.

---

## 7. Submission Status

- **Phase**: **Phase 5 (Submission Ready)**
- **Audit**: `found 0 vulnerabilities`
- **TypeScript**: `0 errors`
- **Linting**: `0 errors, 0 warnings`
- **Build**: `25/25 static pages and routes generated`
