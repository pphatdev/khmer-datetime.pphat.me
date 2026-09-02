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
        default: "KH DateTime Formatter | Modern Localization Utility",
        template: "%s | KH DateTime",
    },
    description: "A robust, lightweight TypeScript utility to format dates and times into localized strings, with first-class support for Khmer standard and lunar calendars.",
    keywords: [
        "khmer date formatter", 
        "khmer lunar calendar", 
        "javascript date format", 
        "typescript date format", 
        "pphatdev", 
        "format-datetime", 
        "cambodia datetime",
        "soriyatra calendar",
        "khmer astronomical calculations",
        "buddhist era converter",
        "moha songkran calculation",
        "khmer leap year adhika meas",
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
        title: "KH DateTime Formatter | Modern Localization Utility",
        description: "A robust, lightweight TypeScript utility to format dates and times into localized strings, featuring built-in Khmer Lunar support.",
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
        title: "KH DateTime Formatter | Modern Localization Utility",
        description: "A robust, lightweight TypeScript utility to format dates and times into localized strings, featuring built-in Khmer Lunar support.",
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
    "@type": "WebApplication",
    "name": "KH DateTime Formatter",
    "alternateName": "Khmer DateTime & Lunar Calendar Utility",
    "url": "https://format-datetime.pphat.me",
    "logo": "https://format-datetime.pphat.me/logo/logo-dark.png",
    "image": "https://format-datetime.pphat.me/cover.png",
    "description": "A robust, lightweight TypeScript utility to format dates and times into localized strings, with first-class support for Khmer standard and lunar calendars.",
    "applicationCategory": "DeveloperApplication",
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
