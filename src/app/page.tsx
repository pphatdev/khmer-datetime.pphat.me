import type { Metadata } from 'next';
import HomeContent from '@/components/home-content';

export const metadata: Metadata = {
    title: "KH DateTime Formatter | Modern Localization Utility",
    description: "A robust, lightweight TypeScript utility to format dates and times into localized strings, with first-class support for Khmer standard and lunar calendars.",
    openGraph: {
        title: "KH DateTime Formatter | Modern Localization Utility",
        description: "A robust, lightweight TypeScript utility to format dates and times into localized strings, with first-class support for Khmer standard and lunar calendars.",
        url: "https://format-datetime.pphat.me",
        images: [
            {
                url: "/thumbnail/home.webp",
                width: 1200,
                height: 630,
                alt: "KH DateTime Formatter Home Thumbnail",
            }
        ]
    },
    twitter: {
        card: "summary_large_image",
        title: "KH DateTime Formatter | Modern Localization Utility",
        description: "A robust, lightweight TypeScript utility to format dates and times into localized strings, with first-class support for Khmer standard and lunar calendars.",
        images: ["/thumbnail/home.webp"]
    }
};

export default function Home() {
    return <HomeContent />;
}
