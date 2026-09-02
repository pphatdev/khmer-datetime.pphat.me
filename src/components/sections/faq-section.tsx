'use client';

import React, { useState } from "react";
import { HelpCircle, ChevronDown, Sparkles, MoonStar, Code2, Cpu, CheckCircle2, Copy, Check, Zap, Star } from "lucide-react";

export interface FaqItem {
    id: string;
    question: string;
    badge: string;
    bestPoint: string;
    isFeatured?: boolean;
    category: 'general' | 'lunar' | 'tokens' | 'runtimes';
    answer: string;
    codeExample?: string;
}

export const FAQ_ITEMS: FaqItem[] = [
    {
        id: "what-is-format-datetime",
        category: "general",
        isFeatured: true,
        badge: "Zero Dependencies • ~4KB",
        bestPoint: "100% native ECMAScript standard Intl APIs with zero external dependencies, adding only ~4KB (solar) or ~8KB (with lunar) to your bundle.",
        question: "What is @pphatdev/format-datetime and how does it work?",
        answer: "@pphatdev/format-datetime is a zero-dependency, high-performance TypeScript library designed for formatting dates and times into localized strings. It features first-class Khmer (km-KH) localization with native Khmer numerals (០-៩), traditional time-of-day phrases, and full astronomical Khmer lunar calendar arithmetic (Buddhist Era, Jolak Sakaraj, 12-animal cycle, 10-era Sak, and waxing/waning moon phases).",
        codeExample: `import { FormatDateTime } from '@pphatdev/format-datetime';

const dt = new FormatDateTime(new Date(), 'YYYY-MM-DD hh:mm:ss A', 'km-KH');
console.log(dt.formatDate()); 
// Output: "២០២៦-០៩-០២ ០១:២៦:៥៩ រសៀល"`
    },
    {
        id: "khmer-lunar-calendar-calculation",
        category: "lunar",
        isFeatured: true,
        badge: "Real Soriyatra Engine",
        bestPoint: "Uses true mathematical astronomy ported from the traditional Soriyatra treatise (1900 UTC epoch) rather than error-prone static lookup tables.",
        question: "How does the Khmer Lunar Calendar calculation work?",
        answer: "The library implements authentic astronomical arithmetic ported from the traditional Khmer treatise (Soriyatra / គម្ពីរព្រះសុរិយាត្រ) rather than static lookup tables. Starting from a 1900 UTC epoch, it computes Aharkun (elapsed days), Avoman (lunar residue), Bodithey (lunar phase), and Kromthupul to accurately calculate the Buddhist Era (BE) with the Visakha Bochea cutoff, Jolak Sakaraj (JS) with the Moha Songkran cutoff, and waxing/waning moon phases.",
        codeExample: `import { KhmerDate } from '@pphatdev/format-datetime';

const khmer = new KhmerDate('2026-04-14');
console.log(khmer.toLunarDate('full'));
// Output: "ថ្ងៃអង្គារ ១២រោច ខែចេត្រ ឆ្នាំរោង ឆស័ក ពុទ្ធសករាជ ២៥៦៩"`
    },
    {
        id: "supported-tokens",
        category: "tokens",
        isFeatured: true,
        badge: "Longest-First Token Match",
        bestPoint: "Single-pass regex engine sorted longest-token-first ensures complex tokens (e.g. MMMM, BBBB) never collide with shorter tokens (MM, BB).",
        question: "What format tokens are supported for Solar and Lunar dates?",
        answer: "The formatter processes tokens via a single-pass, longest-first regular expression to prevent substring conflicts. Supported Solar tokens include YYYY, YY, MMMM, MMM, MM, M, DD, D, dddd, ddd, HH, H, hh, h, mm, ss, A, a, and Z. Supported Lunar tokens include BBBB (Buddhist Era in Khmer numerals), BBB (BE in Arabic digits), lM (Lunar month), lD/lDD (Lunar day 1-15), lN/lW (Moon status Waxing/Waning), lA (Animal year), lS (Sak era), lK (Khmer weekday), and lJ (Jolak Sakaraj).",
        codeExample: `import { FormatDateTime } from '@pphatdev/format-datetime';

// Mixed Solar + Lunar Token Template
const dt = new FormatDateTime(new Date(), 'ថ្ងៃlK ទីDD ខែlM ឆ្នាំlA lS ព.ស. BBBB', 'km-KH');
console.log(dt.formatDate());
// Output: "ថ្ងៃពុធ ទី០២ ខែពិសាខ ឆ្នាំរោង ឆស័ក ព.ស. ២៥៧០"`
    },
    {
        id: "khmer-time-of-day-phrases",
        category: "tokens",
        badge: "6-Bucket Khmer Phrases",
        bestPoint: "Automatically categorizes 24h timestamps into traditional Khmer day phrases: អាធ្រាត្រ, ព្រឹក, ថ្ងៃត្រង់, រសៀល, ល្ងាច, and យប់.",
        question: "How are Khmer time-of-day phrases mapped for AM/PM (A/a tokens)?",
        answer: "When using the Khmer locale (km-KH), the 'A' and 'a' tokens automatically map into six traditional time-of-day phrases based on the 24-hour timestamp: 00:00-04:59 → អាធ្រាត្រ (Midnight/Late Night), 05:00-11:59 → ព្រឹក (Morning), 12:00-12:59 → ថ្ងៃត្រង់ (Noon), 13:00-16:59 → រសៀល (Afternoon), 17:00-19:59 → ល្ងាច (Evening), and 20:00-23:59 → យប់ (Night).",
        codeExample: `import { FormatDateTime } from '@pphatdev/format-datetime';

const morning = new FormatDateTime(new Date('2026-09-02T08:30:00'), 'hh:mm A', 'km-KH');
console.log(morning.formatDate()); // "០៨:៣០ ព្រឹក"

const night = new FormatDateTime(new Date('2026-09-02T21:45:00'), 'hh:mm A', 'km-KH');
console.log(night.formatDate());   // "០៩:៤៥ យប់"`
    },
    {
        id: "leap-year-handling",
        category: "lunar",
        badge: "Adhikamas & Chantreathimeas",
        bestPoint: "Accurately reconciles both 384-day leap-month years (Adhikamas) and 355-day leap-day years (Chantreathimeas).",
        question: "How are Khmer leap years (Adhikamas and Chantreathimeas) handled?",
        answer: "The Soriyatra algorithm calculates two independent leap conditions: Adhikamas (អធិកមាស) inserts a 30-day leap month (creating បឋមាសាឍ and ទុតិយាសាឍ, resulting in a 384-day year), while Chantreathimeas (ចន្ទ្រាធិមាស) extends the month of ជេស្ឋ (Jesth) to 30 days instead of 29 (resulting in a 355-day year). Normal lunar years contain 354 days.",
        codeExample: `import { KhmerDate } from '@pphatdev/format-datetime';

// 2026 Leap-Year Verification
const khDate = new KhmerDate(new Date('2026-07-13'));
console.log(khDate.toLunarDate('full'));
// Resolves 384-day Adhikamas leap month ("បឋមាសាឍ" / "ទុតិយាសាឍ")`
    },
    {
        id: "runtime-framework-support",
        category: "runtimes",
        badge: "Universal Runtime",
        bestPoint: "Runs seamlessly on Node.js 20+, Bun, Deno (JSR), Cloudflare Workers, Next.js, and Expo React Native.",
        question: "Which runtimes, platforms, and frameworks are supported?",
        answer: "It runs natively on Node.js (≥20), Bun, Deno (via JSR), Cloudflare Workers, Vercel Edge, and modern web browsers. It requires zero configuration in Next.js (App Router & Pages Router), Nuxt, SvelteKit, Astro, Remix, Vite, and Expo/React Native (Hermes engine).",
        codeExample: `// React / Next.js Live Clock Hook
import { useState, useEffect } from 'react';
import { FormatDateTime } from '@pphatdev/format-datetime';

export function useKhmerTime(format = 'YYYY-MM-DD hh:mm:ss A') {
  const [time, setTime] = useState('');
  useEffect(() => {
    const tick = () => setTime(new FormatDateTime(new Date(), format, 'km-KH').formatDate());
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [format]);
  return time;
}`
    },
    {
        id: "comparison-date-fns-momentkh",
        category: "general",
        badge: "Modern Architecture",
        bestPoint: "Full tree-shaking with sideEffects: false, dual npm + JSR publishing, and astronomical precision.",
        question: "How does this compare to date-fns, Day.js, or moment-kh?",
        answer: "Standard libraries like date-fns and Day.js lack support for the Khmer lunar calendar, Buddhist Era cutoffs, and Soriyatra New Year projections. Compared to legacy libraries, @pphatdev/format-datetime is fully tree-shakable (sideEffects: false), has zero dependencies, adds only ~4KB (solar) to ~8KB (with lunar) gzipped to your bundle, and is published to both npm and JSR."
    },
    {
        id: "llms-ai-ingestion",
        category: "general",
        badge: "LLM / AI Ready",
        bestPoint: "Includes standardized /llms.txt and /llms-full.txt endpoints optimized for LLM context ingestion.",
        question: "Where can AI agents and LLMs access full documentation?",
        answer: "This project provides standard LLMs ingestion endpoints: /llms.txt for concise token tables and architectural summaries, and /llms-full.txt for the consolidated complete markdown documentation."
    }
];

// Syntax Highlighted Code Component
function HighlightedCode({ code }: { code: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const renderLine = (line: string, idx: number) => {
        if (line.trim().startsWith('//') || line.trim().startsWith('/*') || line.trim().startsWith('*')) {
            return (
                <span key={idx} className="text-[#8b949e] italic block leading-relaxed font-[family-name:var(--font-kantumruy)]">
                    {line}
                </span>
            );
        }

        const tokenRegex = /(\/\/[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\b(?:import|from|const|let|var|new|return|function|class|type|interface|as|default|export|typeof|async|await)\b|\b(?:FormatDateTime|KhmerDate|Date|console|Response|Request)\b|\b(?:formatDate|toLunarDate|toKhmerDate|formatLunarDate|getKhNewYearMoment|format|log|useState|useEffect|setInterval|clearInterval|tick|setTime)\b|[{}();,.]|\b\d+\b)/g;

        const parts: React.ReactNode[] = [];
        let lastIndex = 0;
        let match;

        while ((match = tokenRegex.exec(line)) !== null) {
            if (match.index > lastIndex) {
                parts.push(line.slice(lastIndex, match.index));
            }
            const token = match[0];
            if (token.startsWith('//')) {
                parts.push(
                    <span key={match.index} className="text-[#8b949e] italic font-[family-name:var(--font-kantumruy)]">
                        {token}
                    </span>
                );
            } else if (token.startsWith('"') || token.startsWith("'") || token.startsWith('`')) {
                parts.push(
                    <span key={match.index} className="text-[#a5d6ff] font-[family-name:var(--font-kantumruy)]">
                        {token}
                    </span>
                );
            } else if (['import', 'from', 'const', 'let', 'var', 'new', 'return', 'function', 'class', 'type', 'interface', 'as', 'default', 'export', 'typeof', 'async', 'await'].includes(token)) {
                parts.push(<span key={match.index} className="text-[#ff7b72] font-semibold">{token}</span>);
            } else if (['FormatDateTime', 'KhmerDate', 'Date', 'console', 'Response', 'Request'].includes(token)) {
                parts.push(<span key={match.index} className="text-[#79c0ff] font-medium">{token}</span>);
            } else if (['formatDate', 'toLunarDate', 'toKhmerDate', 'formatLunarDate', 'getKhNewYearMoment', 'format', 'log', 'useState', 'useEffect', 'setInterval', 'clearInterval', 'tick', 'setTime'].includes(token)) {
                parts.push(<span key={match.index} className="text-[#d2a8ff]">{token}</span>);
            } else if (/^\d+$/.test(token)) {
                parts.push(<span key={match.index} className="text-[#79c0ff]">{token}</span>);
            } else {
                parts.push(<span key={match.index} className="text-neutral-400">{token}</span>);
            }
            lastIndex = tokenRegex.lastIndex;
        }

        if (lastIndex < line.length) {
            parts.push(line.slice(lastIndex));
        }

        return (
            <span key={idx} className="block leading-relaxed">
                {parts.length > 0 ? parts : '\u00A0'}
            </span>
        );
    };

    return (
        <div className="relative group bg-[#0d1117] dark:bg-black rounded-xl border border-neutral-200/10 dark:border-white/10 mt-3 overflow-hidden shadow-lg">
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-white/5 text-[11px] font-mono text-neutral-400">
                <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-500/80 inline-block shadow-sm shadow-teal-500/50" />
                    <span className="font-semibold text-neutral-300">TypeScript</span>
                </span>
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-all text-xs cursor-pointer border border-white/5"
                    title="Copy code"
                >
                    {copied ? (
                        <>
                            <Check className="w-3.5 h-3.5 text-teal-400" />
                            <span className="text-teal-400 font-medium">Copied!</span>
                        </>
                    ) : (
                        <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                        </>
                    )}
                </button>
            </div>
            <div className="p-4 overflow-x-auto">
                <pre className="text-xs sm:text-sm font-mono text-neutral-200 leading-relaxed pr-8">
                    <code>{code.split('\n').map((line, i) => renderLine(line, i))}</code>
                </pre>
            </div>
        </div>
    );
}

export function FaqSection() {
    const [openId, setOpenId] = useState<string | null>("what-is-format-datetime");
    const [selectedCategory, setSelectedCategory] = useState<string>("all");

    const filteredFaqs = selectedCategory === "all" 
        ? FAQ_ITEMS 
        : FAQ_ITEMS.filter(item => item.category === selectedCategory);

    // Generate JSON-LD Schema for Google SEO Rich Snippets
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": FAQ_ITEMS.map((faq) => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": `${faq.bestPoint} ${faq.answer}`
            }
        }))
    };

    const categories = [
        { id: "all", label: "All Questions", icon: Sparkles },
        { id: "general", label: "General & Overview", icon: HelpCircle },
        { id: "lunar", label: "Khmer Lunar & Soriyatra", icon: MoonStar },
        { id: "tokens", label: "Tokens & Phrases", icon: Code2 },
        { id: "runtimes", label: "Runtimes & Frameworks", icon: Cpu },
    ];

    return (
        <section id="faq" className="w-full flex flex-col gap-8 scroll-mt-24">
            {/* Inject FAQ Schema for SEO */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-neutral-200 dark:border-white/10 pb-6">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-2xl border border-teal-500/20">
                            <HelpCircle className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                            Knowledge Base & FAQ
                        </span>
                    </div>
                    <h2 className="text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-2xl">
                        Explore key architectural points, Soriyatra astronomical formulas, token mappings, and multi-runtime integration details.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-sm">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Schema.org Validated
                    </span>
                </div>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex flex-wrap gap-2">
                {categories.map((cat) => {
                    const Icon = cat.icon;
                    const isActive = selectedCategory === cat.id;
                    return (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 border cursor-pointer ${
                                isActive
                                    ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 border-transparent shadow-md"
                                    : "bg-neutral-100 dark:bg-neutral-900/50 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-white/5 hover:border-teal-500/30 hover:text-neutral-900 dark:hover:text-white"
                            }`}
                        >
                            <Icon className="w-3.5 h-3.5" />
                            <span>{cat.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Accordion FAQ List */}
            <div className="flex flex-col gap-3">
                {filteredFaqs.map((faq) => {
                    const isOpen = openId === faq.id;
                    return (
                        <div
                            key={faq.id}
                            className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                                isOpen
                                    ? "bg-white dark:bg-neutral-900/70 border-teal-500/40 shadow-xl shadow-teal-500/5"
                                    : "bg-neutral-50/70 dark:bg-neutral-900/30 border-neutral-200 dark:border-white/5 hover:border-neutral-300 dark:hover:border-white/10"
                            } ${faq.isFeatured ? "ring-1 ring-teal-500/20" : ""}`}
                        >
                            <button
                                onClick={() => setOpenId(isOpen ? null : faq.id)}
                                className="w-full flex items-center justify-between p-5 text-left gap-4 cursor-pointer"
                                aria-expanded={isOpen}
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 flex-wrap">
                                    <span className="text-base font-bold text-neutral-900 dark:text-white leading-snug">
                                        {faq.question}
                                    </span>
                                    {faq.badge && (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 w-fit">
                                            {faq.isFeatured && <Star className="w-3 h-3 fill-teal-500/30 text-teal-500" />}
                                            {faq.badge}
                                        </span>
                                    )}
                                </div>
                                <div className={`p-1.5 rounded-full transition-transform duration-300 shrink-0 ${
                                    isOpen 
                                        ? "bg-teal-500/20 text-teal-600 dark:text-teal-400 rotate-180" 
                                        : "bg-neutral-200 dark:bg-white/10 text-neutral-500 dark:text-neutral-400"
                                }`}>
                                    <ChevronDown className="w-4 h-4" />
                                </div>
                            </button>

                            {isOpen && (
                                <div className="px-5 pb-5 pt-1 flex flex-col gap-4 border-t border-neutral-100 dark:border-white/5 text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed animate-in fade-in-50 duration-200">
                                    {/* Best Point Highlight Card */}
                                    <div className="flex items-start gap-3 p-3.5 rounded-xl bg-teal-500/10 border border-teal-500/25 text-teal-950 dark:text-teal-100 text-xs sm:text-sm font-medium shadow-sm">
                                        <div className="p-1 rounded-md bg-teal-500/20 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5">
                                            <Zap className="w-3.5 h-3.5 fill-teal-500/40" />
                                        </div>
                                        <div>
                                            <span className="font-bold text-teal-700 dark:text-teal-300 mr-1.5 uppercase tracking-wider text-[10px] font-mono">
                                                Key Highlight:
                                            </span>
                                            {faq.bestPoint}
                                        </div>
                                    </div>

                                    <p className="leading-relaxed">{faq.answer}</p>

                                    {faq.codeExample && (
                                        <HighlightedCode code={faq.codeExample} />
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
export default FaqSection;
