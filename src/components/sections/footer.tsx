'use client';

import React from "react";
import { ShieldCheck, ExternalLink } from "lucide-react";
import Link from "next/link";
import pkg from '../../../package.json';

export default function Footer() {
    return (
        <footer className="relative w-full pb-12 sm:pb-16 pt-10 sm:pt-14 flex flex-col items-center overflow-hidden mt-8 sm:mt-12 border-t border-neutral-200/60 dark:border-white/5">
            {/* Ambient background glow effect */}
            <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-87.5 sm:w-150 h-50 sm:h-75 bg-teal-500/10 dark:bg-teal-500/15 blur-[90px] rounded-full pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center gap-6 sm:gap-8 w-full max-w-4xl px-4 text-center">
                {/* Responsive Badges (NPM Provenance & Creator) */}
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center justify-center w-full">
                    {/* NPM Provenance Badge */}
                    <a
                        href="https://www.npmjs.com/package/@pphatdev/format-datetime"
                        target="_blank"
                        rel="noreferrer"
                        className="w-full sm:w-auto flex items-center gap-3 p-2 pr-5 rounded-2xl sm:rounded-full bg-white/70 dark:bg-white/5 border border-neutral-200 dark:border-white/10 hover:border-teal-500/30 hover:bg-white dark:hover:bg-white/10 transition-all duration-300 backdrop-blur-xl shadow-sm"
                    >
                        <div className="w-10 h-10 rounded-xl sm:rounded-full flex items-center justify-center bg-teal-500/10 text-teal-600 dark:text-teal-400 shrink-0">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col text-left">
                            <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium leading-none">
                                Verified
                            </span>
                            <span className="text-sm font-bold text-neutral-900 dark:text-white leading-tight mt-0.5">
                                NPM Provenance
                            </span>
                        </div>
                    </a>

                    {/* Creator Badge */}
                    <a
                        href="https://pphat.me"
                        target="_blank"
                        rel="noreferrer"
                        className="w-full sm:w-auto flex items-center gap-3 p-2 pr-5 rounded-2xl sm:rounded-full bg-white/70 dark:bg-white/5 border border-neutral-200 dark:border-white/10 hover:border-teal-500/30 hover:bg-white dark:hover:bg-white/10 transition-all duration-300 backdrop-blur-xl shadow-sm group"
                    >
                        <img
                            src="https://github.com/pphatdev.png"
                            alt="PPhat"
                            className="w-10 h-10 rounded-xl sm:rounded-full object-cover grayscale opacity-85 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300 shrink-0"
                        />
                        <div className="flex flex-col text-left">
                            <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium leading-none">
                                Created by
                            </span>
                            <span className="text-sm font-bold text-neutral-900 dark:text-white leading-tight mt-0.5">
                                PPhat
                            </span>
                        </div>
                    </a>
                </div>

                {/* Quick Navigation Footer Links */}
                <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs sm:text-sm font-semibold text-neutral-600 dark:text-neutral-400">
                    <Link href="/" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                        Home
                    </Link>
                    <Link href="/calendar" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                        Calendar
                    </Link>
                    <Link href="/holidays" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                        Holidays
                    </Link>
                    <a href="/#playground" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                        Playground
                    </a>
                    <a href="/#faq" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                        FAQ
                    </a>
                    <a href="/llms.txt" target="_blank" rel="noreferrer" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors flex items-center gap-1">
                        llms.txt
                        <ExternalLink className="w-3 h-3 opacity-60" />
                    </a>
                    <a href="https://github.com/pphatdev/format-datetime" target="_blank" rel="noreferrer" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors flex items-center gap-1">
                        GitHub
                        <ExternalLink className="w-3 h-3 opacity-60" />
                    </a>
                </div>

                {/* Copyright and Metadata */}
                <div className="flex flex-col items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400 pt-2 border-t border-neutral-100 dark:border-white/5 w-full">
                    <p className="flex items-center gap-1.5 font-medium">
                        <span>MIT License</span>
                        <span>•</span>
                        <span>v{pkg.version}</span>
                        <span>•</span>
                        <span>Zero Dependencies</span>
                    </p>
                    <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
                        © 2026 @pphatdev/format-datetime. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}