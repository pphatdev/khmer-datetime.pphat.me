import type { Metadata } from "next";
import { Kantumruy_Pro, Poppins } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";

const kantumruyPro = Kantumruy_Pro({ 
    subsets: ['khmer'], 
    variable: '--font-kantumruy' 
});

const poppins = Poppins({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700', '800'],
    variable: '--font-poppins'
});

export const metadata: Metadata = {
    metadataBase: new URL("https://format-datetime.pphat.me"),
    title: {
        default: "Khmer Calendar & Lunar Date | KH DateTime (ប្រតិទិនខ្មែរ)",
        template: "%s | KH DateTime",
    },
    description: "Interactive Khmer Calendar, today's lunar date in Cambodia, Buddhist Era (BE), Cambodian public holidays, and zero-dependency TypeScript date formatting utility.",
    keywords: [
        // High-Impression Search Queries
        "khmer calendar",
        "khmer lunar calendar",
        "calendar khmer",
        "khmer calendar today",
        "what day is today in cambodia",
        "what day is today in khmer calendar",
        "what is today in khmer calendar",
        "today in khmer calendar",
        "today khmer date",
        "khmer date today",
        "today date in khmer",
        "date in khmer",
        "khmer lunar calendar today",
        // Calendar Years and Months
        "khmer calendar 2026",
        "calendar khmer 2026",
        "khmer calendar 2026 november",
        "khmer calendar 2025",
        "khmer calendar 2024",
        "calendar 2022 khmer",
        "khmer calendar 2019",
        "khmer month",
        "khmer year",
        "day khmer",
        // Khmer Script Terms & Common Typos
        "ប្រតិទិន",
        "ប្រត្តិទិន",
        "ប្រតិទិន ខ្មែរ 2026",
        "ប្រតិទិន 2025",
        "ប្រតិទិនចន្ទគតិខ្មែរ",
        "ថ្ងៃខែ",
        "ថ្ងៃខែខ្មែរ",
        "ថ្ងៃនេះ",
        "ថ្ងៃសីល",
        "ពុទ្ធសករាជ",
        // Multilingual: Vietnamese (Khmer Krom) & French
        "lịch khmer",
        "lịch khmer hôm nay",
        "lịch khmer hôm này",
        "lịch khmer hôm nay ngày mấy",
        "lịch âm khmer",
        "calendrier khmer",
        "calendrier lunaire khmer",
        // General Lunar & Astronomy
        "buddhist calendar",
        "lunar calendar",
        "lunar",
        "luna khmer",
        "soriyatra calendar",
        "chhankitek",
        "moha songkran calculation",
        "khmer leap year adhika meas",
        "cambodia public holidays",
        "cambodia datetime",
        "khmer date formatter",
        "pphatdev",
        "format-datetime",
        "llms.txt khmer datetime"
    ],
    authors: [{ name: "PPhat", url: "https://pphat.me" }],
    creator: "PPhat",
    publisher: "PPhat",
    icons: {
        icon: [
            { url: "/logo/4dark/favicon-16x16.png", sizes: "16x16", type: "image/png", media: "(prefers-color-scheme: light)" },
            { url: "/logo/4dark/favicon-32x32.png", sizes: "32x32", type: "image/png", media: "(prefers-color-scheme: light)" },
            { url: "/logo/4light/favicon-16x16.png", sizes: "16x16", type: "image/png", media: "(prefers-color-scheme: dark)" },
            { url: "/logo/4light/favicon-32x32.png", sizes: "32x32", type: "image/png", media: "(prefers-color-scheme: dark)" },
            { url: "/logo/4dark/favicon.ico", media: "(prefers-color-scheme: light)" },
            { url: "/logo/4light/favicon.ico", media: "(prefers-color-scheme: dark)" },
        ],
        apple: [
            { url: "/logo/4dark/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
        ],
        other: [
            { rel: "icon", url: "/logo/4dark/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
            { rel: "icon", url: "/logo/4dark/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
        ],
    },
    manifest: "/site.webmanifest",
    openGraph: {
        type: "website",
        locale: "en_US",
        url: "https://format-datetime.pphat.me",
        title: "Khmer Calendar & Lunar Date | KH DateTime (ប្រតិទិនខ្មែរ)",
        description: "Interactive Khmer Calendar, today's lunar date in Cambodia, Buddhist Era, Cambodian public holidays, and TypeScript date formatting utility.",
        siteName: "KH DateTime Formatter",
        images: [
            {
                url: "/thumbnail/home.webp",
                width: 1200,
                height: 630,
                alt: "KH DateTime Formatter Thumbnail",
            },
            {
                url: "/cover.png",
                width: 1200,
                height: 630,
                alt: "KH DateTime Formatter Cover",
            },
            {
                url: "/logo/logo-dark.png",
                width: 512,
                height: 512,
                alt: "KH DateTime Formatter Logo",
            }
        ]
    },
    twitter: {
        card: "summary_large_image",
        title: "Khmer Calendar & Lunar Date | KH DateTime (ប្រតិទិនខ្មែរ)",
        description: "Interactive Khmer Calendar, today's lunar date in Cambodia, Buddhist Era, Cambodian public holidays, and TypeScript date formatting utility.",
        creator: "@pphatdev",
        images: ["https://format-datetime.pphat.me/cover.png"]
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
};

const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
        {
            "@type": "WebSite",
            "@id": "https://format-datetime.pphat.me/#website",
            "url": "https://format-datetime.pphat.me",
            "name": "KH DateTime - Khmer Lunar Calendar & Formatter",
            "alternateName": [
                "Khmer Calendar",
                "Khmer Lunar Calendar",
                "Lịch Khmer",
                "Lịch Khmer hôm nay",
                "Calendrier Khmer",
                "ប្រតិទិនខ្មែរ",
                "ប្រត្តិទិន",
                "ប្រតិទិនចន្ទគតិខ្មែរ"
            ],
            "description": "Accurate Khmer lunar calendar, today's date in Cambodia, Buddhist Era, and Cambodian public holidays.",
            "inLanguage": ["km", "en", "vi", "fr"]
        },
        {
            "@type": "WebApplication",
            "@id": "https://format-datetime.pphat.me/#app",
            "name": "KH DateTime Formatter",
            "alternateName": "Khmer Lunar Calendar & DateTime Utility",
            "url": "https://format-datetime.pphat.me",
            "logo": "https://format-datetime.pphat.me/logo/logo-dark.png",
            "image": "https://format-datetime.pphat.me/cover.png",
            "description": "A robust, lightweight TypeScript utility and web application for Khmer standard and lunar calendar arithmetic, today's date lookup, and Cambodian holidays.",
            "applicationCategory": "UtilitiesApplication",
            "operatingSystem": "Any",
            "author": {
                "@type": "Person",
                "name": "PPhat",
                "url": "https://pphat.me"
            },
            "publisher": {
                "@type": "Person",
                "name": "PPhat",
                "url": "https://pphat.me",
                "logo": {
                    "@type": "ImageObject",
                    "url": "https://format-datetime.pphat.me/logo/logo-dark.png"
                }
            }
        }
    ]
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="km" className={cn(poppins.variable, kantumruyPro.variable, "font-sans")} suppressHydrationWarning>
            <body className="min-h-screen flex items-center justify-center relative overflow-x-hidden bg-white dark:bg-black text-neutral-900 dark:text-white transition-colors duration-300">
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                >
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
}
