'use client';

import { Suspense } from 'react';
import { LunarCalendarWidget } from "@/components/lunar-calendar-widget";
import Header from '@/components/sections/header';
import Footer from '@/components/sections/footer';

export default function CalendarPage() {
    return (
        <div className="min-h-screen font-sans w-full selection:bg-teal-500/30 relative flex flex-col items-center overflow-x-hidden">
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

            <main className="relative z-10 flex flex-col items-center pt-20 sm:pt-32 pb-16 sm:pb-24 px-2 sm:px-6 w-full max-w-6xl mx-auto flex-1">
                <section className="w-full">
                    <div className="text-center mb-6 sm:mb-10 px-2">
                        <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-2 sm:mb-3 text-neutral-900 dark:text-white">
                            Khmer Lunar Calendar
                        </h1>
                        <p className="text-xs sm:text-sm md:text-base text-neutral-500 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed">
                            Interactive astronomical calendar synchronized with the traditional Khmer lunar cycle, Buddhist Era, and official Cambodian public holidays.
                        </p>
                    </div>
                    <Suspense fallback={
                        <div className="w-full h-150 rounded-3xl bg-neutral-100/50 dark:bg-white/5 animate-pulse border border-neutral-200 dark:border-white/10 flex items-center justify-center">
                            <span className="text-sm font-medium text-neutral-400">Loading Calendar...</span>
                        </div>
                    }>
                        <LunarCalendarWidget />
                    </Suspense>
                </section>
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}
