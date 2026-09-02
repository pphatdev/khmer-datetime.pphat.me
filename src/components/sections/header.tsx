'use client';

import React, { useState, useEffect } from "react";
import { Clock, MoonStar, Home, Menu, X, HelpCircle, BookOpen, Sliders, Calendar, ExternalLink } from "lucide-react";
import Link from "next/link";
import pkg from '../../../package.json';
import { ThemeToggle } from "@/components/theme-toggle";
import { usePathname } from "next/navigation";

export default function Header() {
    const pathname = usePathname();
    const isCalendar = pathname === "/calendar";
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Auto-close mobile menu on route change or resize to desktop
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [pathname]);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 640) {
                setMobileMenuOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const navLinks = [
        { href: "/", label: "Home", icon: Home, active: !isCalendar },
        { href: "/calendar", label: "Calendar", icon: Calendar, active: isCalendar },
        { href: "/#playground", label: "Playground", icon: Sliders, isAnchor: true },
        { href: "/#faq", label: "FAQ", icon: HelpCircle, isAnchor: true },
        { href: "/llms.txt", label: "LLMs Context", icon: BookOpen, isExternal: true },
    ];

    return (
        <header className="fixed top-3 sm:top-4 left-0 right-0 z-50 px-3 sm:px-4 flex justify-between pointer-events-none">
            <div className="w-full max-w-6xl mx-auto flex justify-end ">

                {/* Main Floating Bar */}
                <nav className="pointer-events-auto w-fit rounded-2xl sm:rounded-full border border-neutral-200/80 dark:border-white/10 bg-white/70 dark:bg-neutral-950/70 backdrop-blur-xl p-3 sm:p-1.5 flex items-center justify-between shadow-xl shadow-black/5 dark:shadow-black/40 transition-all duration-300">

                    {/* Right Actions & Mobile Toggle */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        <ThemeToggle />

                        <a
                            href="https://github.com/pphatdev/format-datetime"
                            target="_blank"
                            rel="noreferrer"
                            aria-label="GitHub Repository"
                            className="p-2 rounded-xl text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                        >
                            <svg aria-hidden="true" viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                                <path d="M12 1C5.9225 1 1 5.9225 1 12C1 16.8675 4.14875 20.9787 8.52125 22.4362C9.07125 22.5325 9.2775 22.2025 9.2775 21.9137C9.2775 21.6525 9.26375 20.7862 9.26375 19.865C6.5 20.3737 5.785 19.1912 5.565 18.5725C5.44125 18.2562 4.905 17.28 4.4375 17.0187C4.0525 16.8125 3.5025 16.3037 4.42375 16.29C5.29 16.2762 5.90875 17.0875 6.115 17.4175C7.105 19.0812 8.68625 18.6137 9.31875 18.325C9.415 17.61 9.70375 17.1287 10.02 16.8537C7.5725 16.5787 5.015 15.63 5.015 11.4225C5.015 10.2262 5.44125 9.23625 6.1425 8.46625C6.0325 8.19125 5.6475 7.06375 6.2525 5.55125C6.2525 5.55125 7.17375 5.2625 9.2775 6.67875C10.1575 6.43125 11.0925 6.3075 12.0275 6.3075C12.9625 6.3075 13.8975 6.43125 14.7775 6.67875C16.8813 5.24875 17.8025 5.55125 17.8025 5.55125C18.4075 7.06375 18.0225 8.19125 17.9125 8.46625C18.6138 9.23625 19.04 10.2125 19.04 11.4225C19.04 15.6437 16.4688 16.5787 14.0213 16.8537C14.42 17.1975 14.7638 17.8575 14.7638 18.8887C14.7638 20.36 14.75 21.5425 14.75 21.9137C14.75 22.2025 14.9563 22.5462 15.5063 22.4362C19.8513 20.9787 23 16.8537 23 12C23 5.9225 18.0775 1 12 1Z"></path>
                            </svg>
                        </a>

                        {/* Mobile Hamburger Toggle Button */}
                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-label="Toggle Navigation Menu"
                            className="p-2 rounded-xl sm:rounded-4xl bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-white/10 transition-colors"
                        >
                            {mobileMenuOpen ? <X className="w-5 h-5 text-teal-500" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </nav>
            </div>

            {/* Mobile Navigation Dropdown Sheet */}
            {mobileMenuOpen && (
                <div className="pointer-events-auto absolute max-w-2xl mx-auto top-16 left-3 right-3 rounded-2xl border border-neutral-200/80 dark:border-white/10 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-2xl p-3 shadow-2xl shadow-black/20 flex flex-col gap-1 animate-in fade-in slide-in-from-top-3 duration-200">
                    {navLinks.map((item) => {
                        const Icon = item.icon;
                        const isExternal = item.isExternal;

                        if (isExternal) {
                            return (
                                <a
                                    key={item.href}
                                    href={item.href}
                                    target="_blank"
                                    rel="noreferrer"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center justify-between p-3 rounded-xl text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-teal-500/10 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 rounded-lg bg-neutral-100 dark:bg-white/5 text-neutral-500">
                                            <Icon className="w-4 h-4" />
                                        </div>
                                        <span>{item.label}</span>
                                    </div>
                                    <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                                </a>
                            );
                        }

                        if (item.isAnchor) {
                            return (
                                <a
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center gap-3 p-3 rounded-xl text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-teal-500/10 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                                >
                                    <div className="p-1.5 rounded-lg bg-neutral-100 dark:bg-white/5 text-neutral-500">
                                        <Icon className="w-4 h-4" />
                                    </div>
                                    <span>{item.label}</span>
                                </a>
                            );
                        }

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`flex items-center justify-between p-3 rounded-xl text-sm font-semibold transition-colors ${item.active
                                        ? "bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20"
                                        : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/5"
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-1.5 rounded-lg ${item.active
                                            ? "bg-teal-500/20 text-teal-600 dark:text-teal-400"
                                            : "bg-neutral-100 dark:bg-white/5 text-neutral-500"
                                        }`}>
                                        <Icon className="w-4 h-4" />
                                    </div>
                                    <span>{item.label}</span>
                                </div>
                                {item.active && (
                                    <span className="w-2 h-2 rounded-full bg-teal-500" />
                                )}
                            </Link>
                        );
                    })}
                </div>
            )}
        </header>
    );
}
