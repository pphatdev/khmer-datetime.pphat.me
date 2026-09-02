'use client';

import { useState, useEffect } from 'react';
import Footer from "@/components/sections/footer";
import { HeroSection } from "@/components/sections/hero-section";
import { ShowcaseSection } from "@/components/sections/showcase-section";
import { QuickStartSection } from "@/components/sections/quick-start-section";
import { PlaygroundSection } from "@/components/sections/playground-section";
import { FaqSection } from "@/components/sections/faq-section";
import Header from "@/components/sections/header";

export default function HomeContent() {
    const [mounted, setMounted] = useState(false);
    const [now, setNow] = useState<Date | null>(null);

    useEffect(() => {
        setMounted(true);
        setNow(new Date());

        const timer = setInterval(() => {
            setNow(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="min-h-screen font-sans w-full selection:bg-teal-500/30 relative">
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
                <div className="absolute top-[30%] left-[-10%] w-150 h-150 opacity-10 dark:opacity-20 blur-[150px] bg-teal-500 rounded-full mix-blend-multiply dark:mix-blend-screen" />
                <div className="absolute top-[60%] right-[-10%] w-150 h-150 opacity-10 dark:opacity-20 blur-[150px] bg-sky-500 rounded-full mix-blend-multiply dark:mix-blend-screen" />
            </div>

            <Header />

            <main className="relative z-10 flex flex-col items-center pt-32 pb-24 px-4 sm:px-8 w-full max-w-6xl mx-auto gap-24">
                <HeroSection />
                <ShowcaseSection mounted={mounted} now={now} />
                <QuickStartSection />
                <PlaygroundSection mounted={mounted} now={now} />
                <FaqSection />
            </main>

            <Footer />
        </div>
    );
}
