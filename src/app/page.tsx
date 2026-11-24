import type { Metadata } from 'next';
import HomeContent from '@/components/home-content';

export const metadata: Metadata = {
    title: "Khmer Calendar & Lunar Date Today | KH DateTime (ប្រតិទិនខ្មែរ)",
    description: "Check what day is today in Cambodia and the Khmer Lunar Calendar. Live Cambodian date, Buddhist Era (BE 2569/2570), public holidays, and TypeScript formatting utility.",
    keywords: [
        "khmer calendar",
        "what day is today in cambodia",
        "what day is today in khmer calendar",
        "khmer lunar calendar",
        "khmer calendar today",
        "khmer date today",
        "today khmer date",
        "today date in khmer",
        "date in khmer",
        "lịch khmer hôm nay",
        "lịch khmer",
        "calendrier khmer",
        "ប្រតិទិន",
        "ប្រត្តិទិន",
        "ប្រតិទិន ខ្មែរ 2026",
        "ប្រតិទិនចន្ទគតិខ្មែរ",
        "ថ្ងៃខែ",
        "buddhist calendar",
        "khmer calendar 2026"
    ],
    openGraph: {
        title: "Khmer Calendar & Lunar Date Today | KH DateTime (ប្រតិទិនខ្មែរ)",
        description: "Check what day is today in Cambodia and the Khmer Lunar Calendar. Live Cambodian date, Buddhist Era, public holidays, and date utility.",
        url: "https://khmer-datetime.pphat.me",
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
        title: "Khmer Calendar & Lunar Date Today | KH DateTime (ប្រតិទិនខ្មែរ)",
        description: "Check what day is today in Cambodia and the Khmer Lunar Calendar. Live Cambodian date, Buddhist Era, public holidays, and date utility.",
        images: ["/thumbnail/home.webp"]
    }
};

export default function Home() {
    return <HomeContent />;
}
