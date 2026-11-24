import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PublicHolidaysWidget } from '@/components/public-holidays-widget';
import Header from '@/components/sections/header';
import Footer from '@/components/sections/footer';

export const metadata: Metadata = {
    title: "Cambodia Public Holidays 2026 & 2025 | បុណ្យជាតិខ្មែរ",
    description: "Official Cambodian public holidays for 2026 and 2025: Khmer New Year (ចូលឆ្នាំខ្មែរ), Pchum Ben (ភ្ជុំបិណ្ឌ), Water Festival, and traditional Buddhist lunar celebrations.",
    keywords: [
        "cambodia public holidays",
        "cambodia holidays 2026",
        "cambodia holidays 2025",
        "khmer calendar",
        "khmer calendar 2026",
        "khmer calendar 2025",
        "khmer holidays",
        "khmer new year 2026",
        "pchum ben 2026",
        "water festival cambodia",
        "បុណ្យជាតិ",
        "ថ្ងៃឈប់សម្រាក",
        "បុណ្យជាតិខ្មែរ",
        "ប្រតិទិនឈប់សម្រាក ២០២៦",
        "lịch nghỉ lễ campuchia",
        "fêtes cambodge"
    ],
    openGraph: {
        title: "Cambodia Public Holidays 2026 & 2025 | បុណ្យជាតិខ្មែរ",
        description: "Explore official Cambodian public holidays by year and month, with exact Khmer translations and traditional Buddhist lunar alignments.",
        url: "https://khmer-datetime.pphat.me/holidays",
        images: [
            {
                url: "/thumbnail/holiday.webp",
                width: 1200,
                height: 630,
                alt: "Cambodia Public Holidays Thumbnail",
            }
        ]
    },
    twitter: {
        card: "summary_large_image",
        title: "Cambodia Public Holidays 2026 & 2025 | បុណ្យជាតិខ្មែរ",
        description: "Explore official Cambodian public holidays by year and month, with exact Khmer translations and traditional Buddhist lunar alignments.",
        images: ["/thumbnail/holiday.webp"]
    }
};

const holidaysJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
        {
            "@type": "BreadcrumbList",
            "itemListElement": [
                {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Home",
                    "item": "https://khmer-datetime.pphat.me"
                },
                {
                    "@type": "ListItem",
                    "position": 2,
                    "name": "Cambodia Public Holidays",
                    "item": "https://khmer-datetime.pphat.me/holidays"
                }
            ]
        },
        {
            "@type": "WebPage",
            "name": "Cambodia Public Holidays 2026 & 2025",
            "alternateName": ["បុណ្យជាតិខ្មែរ", "ថ្ងៃឈប់សម្រាកនៅកម្ពុជា"],
            "description": "Official list of Cambodian public holidays synchronized with solar and lunar calendar calculations.",
            "url": "https://khmer-datetime.pphat.me/holidays"
        }
    ]
};

export default function HolidaysPage() {
    return (
        <div className="min-h-screen font-sans w-full selection:bg-teal-500/30 relative flex flex-col items-center overflow-x-hidden">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(holidaysJsonLd) }}
            />
            {/* Background Elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
                <svg className="absolute inset-0 h-full w-full stroke-black/5 dark:stroke-white/5 mask-[radial-gradient(100%_100%_at_top_center,white,transparent)]">
                    <defs>
                        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse" x="-1" y="-1">
                            <path d="M.5 40V.5H40" fill="none" strokeDasharray="4 4" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" strokeWidth="0" fill="url(#grid)" />
                </svg>

                {/* Main Ambient Lights */}
                <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-250 h-125 opacity-20 dark:opacity-30 blur-[120px] bg-linear-to-r from-rose-500 via-purple-500 to-teal-500 rounded-full mix-blend-multiply dark:mix-blend-screen" />
            </div>

            <Header />

            <main className="relative z-10 flex flex-col items-center pt-20 sm:pt-32 pb-16 sm:pb-24 px-2 sm:px-6 w-full max-w-6xl mx-auto flex-1">
                <section className="w-full">
                    <div className="text-center mb-6 sm:mb-10 px-2">
                        <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-2 sm:mb-3 text-neutral-900 dark:text-white">
                            Cambodia Public Holidays
                        </h1>
                        <p className="text-xs sm:text-sm md:text-base text-neutral-500 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed">
                            Explore official Cambodian public holidays by year and month, with exact Khmer translations and traditional Buddhist lunar alignments.
                        </p>
                    </div>
                    <Suspense fallback={
                        <div className="w-full h-150 rounded-3xl bg-neutral-100/50 dark:bg-white/5 animate-pulse border border-neutral-200 dark:border-white/10 flex items-center justify-center">
                            <span className="text-sm font-medium text-neutral-400">Loading Holidays...</span>
                        </div>
                    }>
                        <PublicHolidaysWidget />
                    </Suspense>
                </section>
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}
