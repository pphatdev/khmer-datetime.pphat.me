import type { Metadata } from 'next';
import { CalendarView } from '@/components/calendar-view';

export const metadata: Metadata = {
    title: "Khmer Lunar Calendar 2026 & Today's Date | ប្រតិទិនចន្ទគតិខ្មែរ",
    description: "Interactive Khmer lunar calendar 2026/2025: check what day is today in Cambodia, waxing and waning moon phases (កើត/រោច), Buddhist Holy Days (ថ្ងៃសីល), and official Cambodian public holidays. Tra cứu lịch Khmer, calendrier khmer.",
    keywords: [
        "khmer calendar",
        "khmer lunar calendar",
        "calendar khmer",
        "khmer calendar 2026",
        "calendar khmer 2026",
        "khmer calendar 2026 november",
        "khmer calendar 2025",
        "khmer calendar 2024",
        "calendar 2022 khmer",
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
        "khmer month",
        "khmer year",
        "day khmer",
        "lịch khmer",
        "lịch khmer hôm nay",
        "lịch khmer hôm này",
        "lịch khmer hôm nay ngày mấy",
        "lịch âm khmer",
        "calendrier khmer",
        "calendrier lunaire khmer",
        "ប្រតិទិន",
        "ប្រត្តិទិន",
        "ប្រតិទិន ខ្មែរ 2026",
        "ប្រតិទិន 2025",
        "ប្រតិទិនចន្ទគតិខ្មែរ",
        "ថ្ងៃខែ",
        "ថ្ងៃខែខ្មែរ",
        "ថ្ងៃសីល",
        "ពុទ្ធសករាជ",
        "buddhist calendar",
        "lunar calendar",
        "luna khmer"
    ],
    openGraph: {
        title: "Khmer Lunar Calendar 2026 & Today's Date | ប្រតិទិនចន្ទគតិខ្មែរ",
        description: "Interactive Khmer lunar calendar 2026/2025: check what day is today in Cambodia, waxing and waning moon phases, Buddhist Holy Days (ថ្ងៃសីល), and official Cambodian public holidays.",
        url: "https://khmer-datetime.pphat.me/calendar",
        images: [
            {
                url: "/thumbnail/calendar.webp",
                width: 1200,
                height: 630,
                alt: "Khmer Lunar Calendar 2026 Thumbnail",
            }
        ]
    },
    twitter: {
        card: "summary_large_image",
        title: "Khmer Lunar Calendar 2026 & Today's Date | ប្រតិទិនចន្ទគតិខ្មែរ",
        description: "Interactive Khmer lunar calendar 2026/2025: check what day is today in Cambodia, waxing and waning moon phases, Buddhist Holy Days (ថ្ងៃសីល), and official Cambodian public holidays.",
        images: ["/thumbnail/calendar.webp"]
    }
};

export default function CalendarPage() {
    return <CalendarView />;
}
