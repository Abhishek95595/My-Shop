import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  getAllPublishedProducts,
  getProductBySlug,
  formatWeight,
  formatAvailability,
} from '@/services/mockProducts';
import { ProductImageGallery } from '@/components/products/ProductImageGallery';
import { ProductDetailActions } from '@/components/products/ProductDetailActions';
import {
  EXACT_WEIGHT_DISCLAIMER,
  STORE_NAME,
} from '@/lib/constants';
import {
  Sparkles,
  ChevronLeft,
  Shield,
  Tag,
  Calendar,
  Layers,
  User,
  Info,
} from 'lucide-react';

interface ProductDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const products = getAllPublishedProducts();
  return products.map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    return {
      title: 'Product Not Found | ' + STORE_NAME,
      description: 'The requested jewellery piece could not be found.',
    };
  }

  return {
    title: `${product.name} (${product.purity} Gold) | ${STORE_NAME}`,
    description: product.shortDescription,
    openGraph: {
      title: `${product.name} | ${STORE_NAME}`,
      description: product.shortDescription,
    },
  };
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
      {/* Back to Catalogue Navigation Breadcrumb */}
      <nav aria-label="Breadcrumb">
        <Link
          href="/catalogue"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-maroon-800 hover:text-maroon-950 bg-cream-50 hover:bg-gold-100 border border-gold-200 px-3.5 py-1.5 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
        >
          <ChevronLeft className="w-4 h-4 text-gold-700" />
          <span>Back to Catalogue</span>
        </Link>
      </nav>

      {/* Main Product Details Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <ProductImageGallery
            images={product.images}
            productName={product.name}
          />
        </div>

        {/* Right Column: Specifications, Information & Actions */}
        <div className="lg:col-span-6 space-y-6">
          {/* Header Badges & SKU */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 bg-maroon-900 text-cream-50 text-xs font-semibold px-3 py-1 rounded-full shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-gold-300" />
                <span>Sample Product</span>
              </span>

              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full shadow-xs ${
                  product.availability === 'available'
                    ? 'bg-emerald-800 text-cream-50'
                    : 'bg-gold-800 text-cream-50'
                }`}
              >
                {formatAvailability(product.availability)}
              </span>

              <span className="text-xs font-bold text-gold-800 bg-gold-100/90 border border-gold-300 px-2.5 py-1 rounded-full">
                {product.purity} Yellow Gold
              </span>
            </div>

            {/* Product Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-maroon-950 leading-tight">
              {product.name}
            </h1>

            {/* SKU Display */}
            <p className="text-xs font-mono text-charcoal-500 tracking-wider">
              SKU: <strong className="text-charcoal-800">{product.sku}</strong>
            </p>
          </div>

          {/* Short Description Overview */}
          <p className="text-sm sm:text-base text-charcoal-700 font-sans leading-relaxed">
            {product.shortDescription}
          </p>

          {/* Specifications Table Grid */}
          <div className="bg-cream-50 border border-gold-200/90 rounded-2xl p-5 shadow-card space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-maroon-900 border-b border-gold-200/60 pb-2">
              Product Specifications
            </h2>

            <div className="grid grid-cols-2 gap-4 text-xs font-sans">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-gold-700 flex-shrink-0" />
                <div>
                  <span className="text-charcoal-500 block">Category</span>
                  <span className="font-semibold text-charcoal-900">
                    {product.category}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gold-700 flex-shrink-0" />
                <div>
                  <span className="text-charcoal-500 block">Classification</span>
                  <span className="font-semibold text-charcoal-900">
                    {product.gender}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-gold-700 flex-shrink-0" />
                <div>
                  <span className="text-charcoal-500 block">Gold Purity</span>
                  <span className="font-semibold text-charcoal-900">
                    {product.purity} Gold
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-gold-700 flex-shrink-0" />
                <div>
                  <span className="text-charcoal-500 block">Approx. Weight</span>
                  <span className="font-serif font-bold text-maroon-900 text-sm">
                    {formatWeight(product.approxWeight)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gold-700 flex-shrink-0" />
                <div>
                  <span className="text-charcoal-500 block">Occasion</span>
                  <span className="font-semibold text-charcoal-900">
                    {product.occasion}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-gold-700 flex-shrink-0" />
                <div>
                  <span className="text-charcoal-500 block">Availability</span>
                  <span className="font-semibold text-charcoal-900">
                    {formatAvailability(product.availability)}
                  </span>
                </div>
              </div>
            </div>

            {/* Exact Weight Disclaimer Notice */}
            <div className="mt-4 pt-3 border-t border-gold-200/60 flex items-start gap-2 text-xs text-charcoal-600 bg-gold-50/50 p-2.5 rounded-lg">
              <Info className="w-4 h-4 text-gold-700 flex-shrink-0 mt-0.5" />
              <p className="italic font-sans leading-snug">
                {EXACT_WEIGHT_DISCLAIMER}
              </p>
            </div>
          </div>

          {/* Detailed Craftsmanship Description */}
          <div className="space-y-2">
            <h3 className="text-sm font-serif font-bold text-maroon-900 uppercase tracking-wide">
              Craftsmanship &amp; Details
            </h3>
            <p className="text-sm text-charcoal-700 font-sans leading-relaxed">
              {product.detailedDescription}
            </p>
          </div>

          {/* Tags Chips */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-2">
              {product.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-cream-200/80 border border-gold-200 text-charcoal-700 text-xs px-2.5 py-1 rounded-full font-sans"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Interactive Wishlist, Shortlist, WhatsApp & Call Actions */}
          <ProductDetailActions product={product} />

          <p className="text-xs text-charcoal-500 text-center font-sans">
            Personal showroom consultations &amp; custom bespoke orders welcomed at our Gorakhpur store.
          </p>
        </div>
      </div>
    </div>
  );
}
