import { Suspense } from 'react';
import { LunarCalendarWidget } from "@/components/lunar-calendar-widget";
import Header from '@/components/sections/header';
import Footer from '@/components/sections/footer';
import { Calendar, MoonStar, Info, Sparkles, BookOpen, Globe } from 'lucide-react';

export const calendarJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
        {
            "@type": "BreadcrumbList",
            "itemListElement": [
                {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Home",
                    "item": "https://format-datetime.pphat.me"
                },
                {
                    "@type": "ListItem",
                    "position": 2,
                    "name": "Khmer Lunar Calendar",
                    "item": "https://format-datetime.pphat.me/calendar"
                }
            ]
        },
        {
            "@type": "SoftwareApplication",
            "name": "Khmer Lunar Calendar",
            "alternateName": [
                "Khmer Calendar 2026",
                "Lịch Khmer",
                "Lịch Khmer hôm nay",
                "Calendrier Khmer",
                "ប្រតិទិនខ្មែរ ២០២៦",
                "ប្រត្តិទិន",
                "ប្រតិទិនចន្ទគតិខ្មែរ"
            ],
            "operatingSystem": "All",
            "applicationCategory": "UtilitiesApplication",
            "description": "Interactive Khmer lunar calendar synchronized with Soriyatra astronomical formulas, Buddhist Era, and Cambodian public holidays.",
            "url": "https://format-datetime.pphat.me/calendar"
        }
    ]
};

export function CalendarView({ slug }: { slug?: string[] }) {
    return (
        <div className="min-h-screen font-sans w-full selection:bg-teal-500/30 relative flex flex-col items-center overflow-x-hidden">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(calendarJsonLd) }}
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
                <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-250 h-125 opacity-20 dark:opacity-30 blur-[120px] bg-linear-to-r from-sky-500 via-teal-500 to-green-500 rounded-full mix-blend-multiply dark:mix-blend-screen" />
            </div>

            <Header />

            <main className="relative z-10 flex flex-col items-center pt-20 sm:pt-32 pb-16 sm:pb-24 px-2 sm:px-6 w-full max-w-6xl mx-auto flex-1 gap-12 sm:gap-16">
                <section className="w-full">
                    <div className="text-center mb-6 sm:mb-10 px-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-teal-500/30 bg-teal-500/10 text-teal-700 dark:text-teal-300 text-xs font-medium mb-4">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Khmer Lunar Calendar 2026 • ប្រតិទិនចន្ទគតិខ្មែរ</span>
                        </div>
                        <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-2 sm:mb-3 text-neutral-900 dark:text-white">
                            Khmer Lunar Calendar
                        </h1>
                        <p className="text-xs sm:text-sm md:text-base text-neutral-500 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed">
                            Accurate traditional Khmer astronomical calendar (គម្ពីរព្រះសុរិយាត្រ) featuring waxing and waning moon phases (កើត/រោច), Buddhist Holy Days (ថ្ងៃសីល), Buddhist Era years, and Cambodian public holidays.
                        </p>
                    </div>
                    <Suspense fallback={
                        <div className="w-full h-150 rounded-3xl bg-neutral-100/50 dark:bg-white/5 animate-pulse border border-neutral-200 dark:border-white/10 flex items-center justify-center">
                            <span className="text-sm font-medium text-neutral-400">Loading Calendar...</span>
                        </div>
                    }>
                        <LunarCalendarWidget initialSlug={slug} />
                    </Suspense>
                </section>

                {/* SEO Informational & Keyword Guide Section */}
                <section className="w-full bg-neutral-50/70 dark:bg-neutral-900/40 rounded-3xl border border-neutral-200/80 dark:border-white/10 p-6 sm:p-10 backdrop-blur-xl">
                    <div className="flex items-center gap-3 mb-6 border-b border-neutral-200 dark:border-white/10 pb-4">
                        <div className="p-2.5 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-2xl border border-teal-500/20">
                            <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white">
                                Khmer Calendar Guide & Reference (មគ្គុទ្ទេសក៍ប្រតិទិនខ្មែរ)
                            </h2>
                            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
                                Understanding traditional Khmer lunar calculations, Buddhist Era, and holy days.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-neutral-600 dark:text-neutral-300">
                        {/* Box 1: What day is today */}
                        <div className="p-5 rounded-2xl bg-white/70 dark:bg-white/5 border border-neutral-200/60 dark:border-white/5 space-y-2">
                            <h3 className="font-bold text-base text-neutral-900 dark:text-white flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                                What Day is Today in Cambodia? (ថ្ងៃនេះជាថ្ងៃអ្វី?)
                            </h3>
                            <p className="leading-relaxed text-xs sm:text-sm">
                                Every day in Cambodia has two synchronized representations: the international Gregorian solar date (e.g., November 2026) and the traditional Khmer lunar date (ថ្ងៃខែចន្ទគតិ). The lunar date indicates the moon phase (១-១៥ កើត Waxing or ១-១៤/១៥ រោច Waning), traditional Khmer month, animal year, and Sak era.
                            </p>
                        </div>

                        {/* Box 2: 12 Khmer Lunar Months */}
                        <div className="p-5 rounded-2xl bg-white/70 dark:bg-white/5 border border-neutral-200/60 dark:border-white/5 space-y-2">
                            <h3 className="font-bold text-base text-neutral-900 dark:text-white flex items-center gap-2">
                                <MoonStar className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                                Khmer Lunar Months (ខែខ្មែរទាំង ១២)
                            </h3>
                            <p className="leading-relaxed text-xs sm:text-sm">
                                The Khmer lunar year is divided into 12 lunar months: <strong>មិគសិរ</strong> (Mikhaseyr), <strong>បុស្ស</strong> (Buss), <strong>មាឃ</strong> (Meak), <strong>ផល្គុន</strong> (Phalkun), <strong>ចេត្រ</strong> (Chet), <strong>ពិសាខ</strong> (Visakh), <strong>ជេស្ឋ</strong> (Jesth), <strong>អាសាឍ</strong> (Asadh), <strong>ស្រាពណ៍</strong> (Srapun), <strong>ភទ្របទ</strong> (Bhadrapada), <strong>អស្សុជ</strong> (Assoch), and <strong>កត្តិក</strong> (Kattik). In leap years (Adhikamas / អធិកមាស), an extra 30-day month (ទុតិយាសាឍ) is added.
                            </p>
                        </div>

                        {/* Box 3: Buddhist Holy Days */}
                        <div className="p-5 rounded-2xl bg-white/70 dark:bg-white/5 border border-neutral-200/60 dark:border-white/5 space-y-2">
                            <h3 className="font-bold text-base text-neutral-900 dark:text-white flex items-center gap-2">
                                <Info className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                                Buddhist Holy Days (ថ្ងៃសីល 2026)
                            </h3>
                            <p className="leading-relaxed text-xs sm:text-sm">
                                Buddhist Holy Days (ថ្ងៃសីល) fall four times per lunar month: on the <strong>8th day of waxing moon (៨កើត)</strong>, the <strong>Full Moon (១៥កើត ពេញបូណ៌មី)</strong>, the <strong>8th day of waning moon (៨រោច)</strong>, and the <strong>New Moon / End of Month (១៤រោច or ១៥រោច ដាច់ខែ)</strong>.
                            </p>
                        </div>

                        {/* Box 4: Multilingual Guide (Lịch Khmer & Calendrier Khmer) */}
                        <div className="p-5 rounded-2xl bg-white/70 dark:bg-white/5 border border-neutral-200/60 dark:border-white/5 space-y-2">
                            <h3 className="font-bold text-base text-neutral-900 dark:text-white flex items-center gap-2">
                                <Globe className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                                Lịch Khmer & Calendrier Khmer
                            </h3>
                            <p className="leading-relaxed text-xs sm:text-sm">
                                <strong>Lịch Khmer (Lịch âm Phật giáo Khmer):</strong> Tra cứu chính xác lịch Khmer hôm nay cho đồng bào Khmer Krom tại Việt Nam và hải ngoại, cập nhật ngày rằm, mùng một, tết Chol Chnam Thmay và lễ Pchum Ben. <br />
                                <strong>Calendrier Khmer:</strong> Calendrier bouddhiste cambodgien synchronisé avec le calendrier grégorien pour la diaspora khmère en France et dans le monde.
                            </p>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}
