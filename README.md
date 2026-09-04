# Khushi Ornament House — Web Platform

Official web showcase and customer consultation application for **Khushi Ornament House**, located in Urdu Bazar, Gorakhpur, Uttar Pradesh. Operating with **25+ Years of Trust** under store proprietor **Dilip Kumar Verma**.

---

## 1. Project Overview

This platform is a showcase catalogue and customer inquiry application designed to:
- Showcase handcrafted gold jewellery (18K, 22K, and 24K purities).
- Facilitate bespoke custom order inquiries and physical showroom consultations.
- Support personal customer Wishlists and Buying Shortlists with Firebase Google authentication.
- Enable approved administrators to manage catalogue products, customer inquiries, and owner-entered reference rates.

---

## 2. Technology Stack

- **Framework**: [Next.js 16.3.3](https://nextjs.org/) App Router (Turbopack development server; webpack production build for host compatibility)
- **Core**: React 19, TypeScript 5
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with custom luxury theme tokens (Ivory/Cream, Maroon, Restrained Gold)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Persistence**: Cloud Firestore, with IndexedDB (`KOH_ImageDB`) for current admin image uploads
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

### B. Google Authentication & Saved Items
- **Google Sign-In**: Real Google account authentication through Firebase Authentication.
- **Firebase Customer ID**: Saved lists are isolated by the authenticated Firebase UID.
- **Wishlist & Shortlist**: Firestore-backed lists available across signed-in devices.

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

## 5. Storage Architecture & Boundaries

1. **Cloud Firestore**:
   - `users/{uid}/wishlist`: Customer wishlist product IDs.
   - `users/{uid}/shortlist`: Customer shortlist product IDs.
   - `products`, `enquiries`, and `rates`: Catalogue and showroom operations.
2. **Local Storage fallback for unconfigured development environments**:
   - `koh_admin_custom_products`: Locally created custom catalogue products.
   - `koh_admin_sample_overrides`: Local edits to baseline sample products.
   - `koh_customer_enquiries`: Saved customer contact inquiries.
   - `koh_owner_rates`: Owner-entered bullion reference rates.
3. **IndexedDB (`KOH_ImageDB`)**:
   - `product_images`: Raw image blobs for admin-uploaded product images (JPG/PNG/WEBP ≤ 5MB).
4. **External Service Boundaries**:
   - Firebase Authentication and Cloud Firestore are connected.
   - Cloudinary, payment gateways, cart checkouts, and shipping delivery systems are not connected.
   - Payment gateways, cart checkouts, and shipping delivery systems are **strictly excluded**.
   - Hosting, deployment, and a purchased production domain are **not configured**.

---

## 6. How to Clear Local Demo Data

To clear browser-local development data and IndexedDB images:
1. In your browser DevTools, go to **Application > Storage**.
2. Click **Clear site data** (clears LocalStorage and IndexedDB).
3. **Sign Out** ends the Firebase session. It does not erase saved lists or other Cloud Firestore records.

---

## 7. Submission Status

- **Phase**: **Phase 5 (Submission Ready)**
- **Audit**: `found 0 vulnerabilities`
- **TypeScript**: `0 errors`
- **Linting**: `0 errors, 0 warnings`
- **Build**: `25/25 static pages and routes generated`
