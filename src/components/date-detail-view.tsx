'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { FormatDateTime } from '@pphatdev/format-datetime';
import Header from '@/components/sections/header';
import Footer from '@/components/sections/footer';
import {
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    Calendar,
    MoonStar,
    Sparkles,
    Copy,
    Check,
    Download,
    Share2,
    Globe,
    Info,
    Clock
} from 'lucide-react';
import {
    fetchCambodiaHolidays,
    formatDateKey,
    PublicHoliday,
    KHMER_HOLIDAY_NAMES,
    SHORT_KHMER_HOLIDAY_NAMES
} from '@/lib/holidays';
import {
    MoonPhaseGraphic,
    parseKhmerLunarDay,
    khmerPhaseNameFor,
    khmerLunarPhaseValue
} from '@/components/date-detail-popup';

interface DateDetailViewProps {
    year: number;
    month: number; // 1-12
    day: number;   // 1-31
}

export function DateDetailView({ year, month, day }: DateDetailViewProps) {
    const [locale, setLocale] = useState('km-KH');
    const [copied, setCopied] = useState<'copy' | 'share' | null>(null);
    const [holidays, setHolidays] = useState<PublicHoliday[]>([]);

    const selectedDate = useMemo(() => new Date(year, month - 1, day), [year, month, day]);
    const dateKey = useMemo(() => formatDateKey(selectedDate), [selectedDate]);

    // Adjacent day navigation links
    const prevDate = useMemo(() => new Date(year, month - 1, day - 1), [year, month, day]);
    const nextDate = useMemo(() => new Date(year, month - 1, day + 1), [year, month, day]);

    const prevUrl = `/calendar/${prevDate.getFullYear()}/${String(prevDate.getMonth() + 1).padStart(2, '0')}/${String(prevDate.getDate()).padStart(2, '0')}`;
    const nextUrl = `/calendar/${nextDate.getFullYear()}/${String(nextDate.getMonth() + 1).padStart(2, '0')}/${String(nextDate.getDate()).padStart(2, '0')}`;
    const monthUrl = `/calendar/${year}/${String(month).padStart(2, '0')}`;

    // Fetch holidays for the current year
    useEffect(() => {
        let isMounted = true;
        fetchCambodiaHolidays(year).then(data => {
            if (isMounted) setHolidays(data);
        }).catch(() => {});
        return () => { isMounted = false; };
    }, [year]);

    const holiday = useMemo(() => {
        return holidays.find(h => h.date === dateKey);
    }, [holidays, dateKey]);

    const intlFormatters = useMemo(() => ({
        monthLong: new Intl.DateTimeFormat(locale, { month: 'long' }),
        weekdayShort: new Intl.DateTimeFormat(locale, { weekday: 'short' }),
        weekdayLong: new Intl.DateTimeFormat(locale, { weekday: 'long' }),
        fullDate: new Intl.DateTimeFormat(locale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
    }), [locale]);

    const lunarStrings = useMemo(() => {
        const safe = (fmt: string, fallback: string) => {
            try { return new FormatDateTime(selectedDate, fmt, locale).formatDate(); }
            catch { return fallback; }
        };
        return {
            weekday: safe('lW', '—'),
            day: safe('ldlN', '—'),
            month: safe('lM', '—'),
            year: safe('lA', '—'),
            era: safe('BBBB', '—'),
            sak: safe('lE', '—'),
            full: safe('ថ្ងៃlW ldlN ខែlM ឆ្នាំlA lE ព.ស. BBBB គ.ស. YYYY', '—'),
        };
    }, [selectedDate, locale]);

    const khmerLunar = useMemo(() => {
        return lunarStrings ? parseKhmerLunarDay(lunarStrings.day) : null;
    }, [lunarStrings]);

    // Buddhist Holy Day check
    const isBuddhistHolyDay = useMemo(() => {
        if (!khmerLunar) return false;
        const { dayNum, isWaxing } = khmerLunar;
        if (isWaxing) return dayNum === 8 || dayNum === 15;
        return dayNum === 8 || dayNum === 14 || dayNum === 15;
    }, [khmerLunar]);

    const holyDayLabel = useMemo(() => {
        if (!khmerLunar || !isBuddhistHolyDay) return null;
        const { dayNum, isWaxing } = khmerLunar;
        if (isWaxing && dayNum === 15) return 'ពេញបូណ៌មី (Full Moon - ថ្ងៃសីលធំ)';
        if (isWaxing && dayNum === 8) return '៨កើត (Waxing Quarter - ថ្ងៃសីល)';
        if (!isWaxing && dayNum === 8) return '៨រោច (Waning Quarter - ថ្ងៃសីល)';
        if (!isWaxing && (dayNum === 14 || dayNum === 15)) return 'ដាច់ខែ (New Moon - ថ្ងៃសីលធំ)';
        return 'ថ្ងៃសីល (Buddhist Holy Day)';
    }, [khmerLunar, isBuddhistHolyDay]);

    const phaseValue = useMemo(() => {
        return khmerLunar ? khmerLunarPhaseValue(khmerLunar.dayNum, khmerLunar.isWaxing) : 0.5;
    }, [khmerLunar]);

    const phaseName = useMemo(() => {
        return khmerLunar ? khmerPhaseNameFor(khmerLunar.dayNum, khmerLunar.isWaxing) : '';
    }, [khmerLunar]);

    const illuminationPct = useMemo(() => {
        const pct = Math.round((1 - Math.cos(phaseValue * 2 * Math.PI)) / 2 * 100);
        return `${pct}%`;
    }, [phaseValue]);

    const khmerHolidayName = holiday ? (KHMER_HOLIDAY_NAMES[holiday.name] || holiday.name) : null;
    const shortKhmerHolidayName = holiday ? SHORT_KHMER_HOLIDAY_NAMES[holiday.name] : null;

    const handleCopy = useCallback(async () => {
        const textToCopy = `${intlFormatters.fullDate.format(selectedDate)}\n${lunarStrings.full}${khmerHolidayName ? `\nបុណ្យជាតិ: ${khmerHolidayName}` : ''}`;
        try {
            await navigator.clipboard.writeText(textToCopy);
            setCopied('copy');
            setTimeout(() => setCopied(null), 2000);
        } catch {}
    }, [selectedDate, lunarStrings, khmerHolidayName, intlFormatters]);

    const handleICS = useCallback(() => {
        const dtStart = dateKey.replace(/-/g, '');
        const next = new Date(selectedDate);
        next.setDate(next.getDate() + 1);
        const dtEnd = formatDateKey(next).replace(/-/g, '');
        const summary = holiday?.name || lunarStrings.full;
        const description = `${intlFormatters.fullDate.format(selectedDate)}\\n${lunarStrings.full}${khmerHolidayName ? `\\n${khmerHolidayName}` : ''}`;
        const stamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        const ics = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//khmer-datetime.pphat.me//EN',
            'CALSCALE:GREGORIAN',
            'BEGIN:VEVENT',
            `UID:${dtStart}-khmer@khmer-datetime.pphat.me`,
            `DTSTAMP:${stamp}`,
            `DTSTART;VALUE=DATE:${dtStart}`,
            `DTEND;VALUE=DATE:${dtEnd}`,
            `SUMMARY:${summary}`,
            `DESCRIPTION:${description}`,
            'END:VEVENT',
            'END:VCALENDAR',
        ].join('\r\n');
        const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `khmer-${dateKey}.ics`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, [selectedDate, lunarStrings, holiday, dateKey, intlFormatters, khmerHolidayName]);

    const handleShare = useCallback(async () => {
        if (typeof window === 'undefined') return;
        const url = window.location.href;
        const title = holiday?.name || intlFormatters.fullDate.format(selectedDate);
        const text = lunarStrings.full;
        if (typeof navigator.share === 'function') {
            try {
                await navigator.share({ title, text, url });
                return;
            } catch {}
        }
        try {
            await navigator.clipboard.writeText(url);
            setCopied('share');
            setTimeout(() => setCopied(null), 2000);
        } catch {}
    }, [selectedDate, lunarStrings, holiday, intlFormatters]);

    return (
        <div className="min-h-screen font-sans w-full selection:bg-teal-500/30 relative flex flex-col items-center overflow-x-hidden">
            {/* Background Atmosphere */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
                <svg className="absolute inset-0 h-full w-full stroke-black/5 dark:stroke-white/5 mask-[radial-gradient(100%_100%_at_top_center,white,transparent)]">
                    <defs>
                        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse" x="-1" y="-1">
                            <path d="M.5 40V.5H40" fill="none" strokeDasharray="4 4" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" strokeWidth="0" fill="url(#grid)" />
                </svg>
                <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-250 h-125 opacity-20 dark:opacity-30 blur-[120px] bg-linear-to-r from-sky-500 via-teal-500 to-green-500 rounded-full mix-blend-multiply dark:mix-blend-screen" />
            </div>

            <Header />

            <main className="relative z-10 flex flex-col items-center pt-20 sm:pt-28 pb-16 sm:pb-24 px-3 sm:px-6 w-full max-w-4xl mx-auto flex-1 gap-6 sm:gap-8">
                
                {/* Navigation Bar: Back + Breadcrumbs + Next/Prev */}
                <div className="w-full flex items-center justify-between gap-2 pb-4">
                    <Link
                        href={monthUrl}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-white/5 dark:hover:bg-white/10 text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-200 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span suppressHydrationWarning>Back to {intlFormatters.monthLong.format(selectedDate)} {year}</span>
                    </Link>

                    <div className="flex items-center gap-1 sm:gap-2">
                        <Link
                            href={prevUrl}
                            className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-white/5 dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-300 transition-colors"
                            title="Previous Day"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Link>
                        <Link
                            href={nextUrl}
                            className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-white/5 dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-300 transition-colors"
                            title="Next Day"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>

                {/* Hero Card */}
                <section className="w-full rounded-3xl bg-white/80 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-white/10 p-6 sm:p-10 backdrop-blur-2xl shadow-xl flex flex-col md:flex-row items-center md:items-start justify-between gap-6 sm:gap-8 relative overflow-hidden">
                    <div className="flex flex-col items-center md:items-start text-center md:text-left flex-1 min-w-0">
                        {/* Badges */}
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-4">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20">
                                <MoonStar className="w-3.5 h-3.5" />
                                <span>Khmer Lunar Date</span>
                            </span>

                            {isBuddhistHolyDay && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/25">
                                    <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500/30" />
                                    <span>{holyDayLabel}</span>
                                </span>
                            )}

                            {holiday && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/25">
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                                    <span>{khmerHolidayName || holiday.name}</span>
                                </span>
                            )}
                        </div>

                        {/* Full Khmer Lunar Date Headline */}
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-neutral-900 dark:text-white font-kantumruy tracking-tight leading-snug mb-2">
                            {lunarStrings.full}
                        </h1>

                        {/* Gregorian Date Subtitle */}
                        <p className="text-sm sm:text-base text-neutral-500 dark:text-neutral-400 font-medium" suppressHydrationWarning>
                            {intlFormatters.fullDate.format(selectedDate)} • ISO: <span className="font-mono text-neutral-700 dark:text-neutral-300">{dateKey}</span>
                        </p>
                    </div>

                    {/* Moon Phase Graphic & Illumination */}
                    <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-neutral-100/60 dark:bg-white/5 border border-neutral-200/50 dark:border-white/5 shrink-0 min-w-36">
                        <MoonPhaseGraphic phase={phaseValue} size={84} />
                        <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 mt-2 font-kantumruy">
                            {lunarStrings.day}
                        </span>
                        <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-mono">
                            {phaseName} • {illuminationPct}
                        </span>
                    </div>
                </section>

                {/* Details Breakdown Grid */}
                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Lunar Specifications Card */}
                    <div className="p-6 rounded-3xl bg-white/70 dark:bg-neutral-900/40 border border-neutral-200/70 dark:border-white/5 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-neutral-200/50 dark:border-white/5">
                                <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
                                    <MoonStar className="w-4 h-4" />
                                </div>
                                <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                                    Khmer Lunar Arithmetic (កាលប្បវត្តិចន្ទគតិ)
                                </h2>
                            </div>

                            <dl className="space-y-3 text-xs sm:text-sm">
                                <div className="flex justify-between items-center py-1 border-b border-neutral-100 dark:border-white/5">
                                    <dt className="text-neutral-500 font-medium">ថ្ងៃសប្តាហ៍ (Weekday)</dt>
                                    <dd className="font-bold text-neutral-900 dark:text-white font-kantumruy">{lunarStrings.weekday}</dd>
                                </div>
                                <div className="flex justify-between items-center py-1 border-b border-neutral-100 dark:border-white/5">
                                    <dt className="text-neutral-500 font-medium">ទី និង ដំណាក់ព្រះចន្ទ (Lunar Day)</dt>
                                    <dd className="font-bold text-teal-600 dark:text-teal-400 font-kantumruy">{lunarStrings.day}</dd>
                                </div>
                                <div className="flex justify-between items-center py-1 border-b border-neutral-100 dark:border-white/5">
                                    <dt className="text-neutral-500 font-medium">ខែចន្ទគតិ (Lunar Month)</dt>
                                    <dd className="font-bold text-neutral-900 dark:text-white font-kantumruy">{lunarStrings.month}</dd>
                                </div>
                                <div className="flex justify-between items-center py-1 border-b border-neutral-100 dark:border-white/5">
                                    <dt className="text-neutral-500 font-medium">ឆ្នាំសត្វ (Animal Year)</dt>
                                    <dd className="font-bold text-neutral-900 dark:text-white font-kantumruy">{lunarStrings.year}</dd>
                                </div>
                                <div className="flex justify-between items-center py-1 border-b border-neutral-100 dark:border-white/5">
                                    <dt className="text-neutral-500 font-medium">ស័ក (Era Sak)</dt>
                                    <dd className="font-bold text-neutral-900 dark:text-white font-kantumruy">{lunarStrings.sak}</dd>
                                </div>
                                <div className="flex justify-between items-center py-1 border-b border-neutral-100 dark:border-white/5">
                                    <dt className="text-neutral-500 font-medium">ពុទ្ធសករាជ (Buddhist Era)</dt>
                                    <dd className="font-bold text-neutral-900 dark:text-white font-kantumruy">ព.ស. {lunarStrings.era}</dd>
                                </div>
                                {isBuddhistHolyDay && (
                                    <div className="flex justify-between items-center py-1">
                                        <dt className="text-neutral-500 font-medium">ឧបោសថសីល (Holy Day)</dt>
                                        <dd className="font-bold text-amber-600 dark:text-amber-400 font-kantumruy">{holyDayLabel}</dd>
                                    </div>
                                )}
                            </dl>
                        </div>
                    </div>

                    {/* Solar & Holiday Specifications Card */}
                    <div className="p-6 rounded-3xl bg-white/70 dark:bg-neutral-900/40 border border-neutral-200/70 dark:border-white/5 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-neutral-200/50 dark:border-white/5">
                                <div className="p-2 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
                                    <Calendar className="w-4 h-4" />
                                </div>
                                <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                                    Gregorian & Official Observances
                                </h2>
                            </div>

                            <dl className="space-y-3 text-xs sm:text-sm">
                                <div className="flex justify-between items-center py-1 border-b border-neutral-100 dark:border-white/5">
                                    <dt className="text-neutral-500 font-medium">Gregorian Date</dt>
                                    <dd className="font-semibold text-neutral-900 dark:text-white" suppressHydrationWarning>{intlFormatters.fullDate.format(selectedDate)}</dd>
                                </div>
                                <div className="flex justify-between items-center py-1 border-b border-neutral-100 dark:border-white/5">
                                    <dt className="text-neutral-500 font-medium">ISO-8601 Key</dt>
                                    <dd className="font-mono text-neutral-900 dark:text-white font-semibold">{dateKey}</dd>
                                </div>
                                <div className="flex justify-between items-center py-1 border-b border-neutral-100 dark:border-white/5">
                                    <dt className="text-neutral-500 font-medium">Timezone Offset</dt>
                                    <dd className="font-mono text-neutral-700 dark:text-neutral-300">UTC+07:00 (Indochina Time)</dd>
                                </div>
                                <div className="flex justify-between items-center py-1 border-b border-neutral-100 dark:border-white/5">
                                    <dt className="text-neutral-500 font-medium">Public Holiday</dt>
                                    <dd className="font-bold text-neutral-900 dark:text-white">
                                        {holiday ? (
                                            <span className="text-rose-600 dark:text-rose-400">{holiday.name}</span>
                                        ) : (
                                            <span className="text-neutral-400 font-normal">None</span>
                                        )}
                                    </dd>
                                </div>
                                {holiday && khmerHolidayName && (
                                    <div className="flex justify-between items-center py-1">
                                        <dt className="text-neutral-500 font-medium">ឈ្មោះបុណ្យជាតិ</dt>
                                        <dd className="font-bold text-rose-600 dark:text-rose-400 font-kantumruy">{khmerHolidayName}</dd>
                                    </div>
                                )}
                            </dl>
                        </div>
                    </div>
                </div>

                {/* Actions & Sharing Card */}
                <div className="w-full flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-white/70 dark:bg-neutral-900/40 border border-neutral-200/70 dark:border-white/5">
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={handleCopy}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-white/5 dark:hover:bg-white/10 text-xs sm:text-sm font-semibold text-neutral-800 dark:text-neutral-200 transition-colors cursor-pointer"
                        >
                            {copied === 'copy' ? <Check className="w-4 h-4 text-teal-500" /> : <Copy className="w-4 h-4" />}
                            <span>{copied === 'copy' ? 'Copied Full Text!' : 'Copy Date Details'}</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleICS}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-white/5 dark:hover:bg-white/10 text-xs sm:text-sm font-semibold text-neutral-800 dark:text-neutral-200 transition-colors cursor-pointer"
                        >
                            <Download className="w-4 h-4" />
                            <span>Export (.ics)</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleShare}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-white/5 dark:hover:bg-white/10 text-xs sm:text-sm font-semibold text-neutral-800 dark:text-neutral-200 transition-colors cursor-pointer"
                        >
                            {copied === 'share' ? <Check className="w-4 h-4 text-teal-500" /> : <Share2 className="w-4 h-4" />}
                            <span>{copied === 'share' ? 'Link Copied!' : 'Share Page'}</span>
                        </button>
                    </div>

                    {/* Language Switcher */}
                    <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-neutral-400" />
                        <select
                            value={locale}
                            onChange={(e) => setLocale(e.target.value)}
                            aria-label="Select display locale"
                            className="bg-neutral-100 dark:bg-white/5 border border-neutral-200/50 dark:border-white/10 text-neutral-900 dark:text-white rounded-xl px-2.5 py-1.5 text-xs font-semibold outline-none cursor-pointer"
                        >
                            <option value="km-KH">Khmer (km-KH)</option>
                            <option value="en-US">English (en-US)</option>
                            <option value="fr-FR">French (fr-FR)</option>
                        </select>
                    </div>
                </div>

            </main>

            <Footer />
        </div>
    );
}

export default DateDetailView;
