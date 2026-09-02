'use client';

import { useState, useMemo, useEffect, useCallback, memo, type ReactNode } from 'react';
import { FormatDateTime } from '@pphatdev/format-datetime';
import {
    MoonStar,
    Moon,
    Globe,
    X,
    Sparkles,
    Copy,
    Check,
    Download,
    Share2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    formatDateKey,
    PublicHoliday,
    KHMER_HOLIDAY_NAMES,
    SHORT_KHMER_HOLIDAY_NAMES
} from '@/lib/holidays';

export type PopupTab = 'lunar' | 'gregorian' | 'holiday';

// Parse a Khmer lunar day string in `ldlN` format (e.g. "១៥កើត", "៨រោច") or Arabic-numeral
// equivalents ("15កើត"). Returns { dayNum: 1..15, isWaxing } or null when unparseable.
const KHMER_DIGITS: Record<string, string> = {
    '០': '0', '១': '1', '២': '2', '៣': '3', '៤': '4',
    '៥': '5', '៦': '6', '៧': '7', '៨': '8', '៩': '9',
};

export function parseKhmerLunarDay(dayStr: string): { dayNum: number; isWaxing: boolean } | null {
    const arabicized = dayStr.split('').map(c => KHMER_DIGITS[c] ?? c).join('');
    const match = arabicized.match(/\d+/);
    if (!match) return null;
    const dayNum = parseInt(match[0], 10);
    if (!Number.isFinite(dayNum) || dayNum < 1 || dayNum > 15) return null;
    const isWaxing = dayStr.includes('កើត');
    if (!isWaxing && !dayStr.includes('រោច')) return null;
    return { dayNum, isWaxing };
}

// Discrete phase name from a Khmer lunar day (independent of astronomical illumination).
export function khmerPhaseNameFor(dayNum: number, isWaxing: boolean): string {
    if (isWaxing) {
        if (dayNum >= 15) return 'Full Moon';
        if (dayNum === 8) return 'First Quarter';
        if (dayNum < 8) return 'Waxing Crescent';
        return 'Waxing Gibbous';
    }
    if (dayNum >= 14) return 'New Moon';
    if (dayNum === 8) return 'Last Quarter';
    if (dayNum < 8) return 'Waning Gibbous';
    return 'Waning Crescent';
}

// Map a Khmer lunar day to a normalized phase 0..1 (0=new, 0.5=full, 1=new).
export function khmerLunarPhaseValue(dayNum: number, isWaxing: boolean): number {
    // 30-day lunar month split: waxing 1..15 → 1/30..15/30 (=0.5=full)
    // waning 1..15 → 16/30..30/30 (≈1=new)
    return isWaxing ? dayNum / 30 : 0.5 + dayNum / 30;
}

export const MoonPhaseGraphic = memo(function MoonPhaseGraphic({
    phase,
    size = 88,
    rotation = 15 
}: { 
    phase: number; 
    size?: number;
    rotation?: number;
}) {
    const r = size / 2;
    const normalizedPhase = ((phase % 1) + 1) % 1; // 0 to 1

    // Dark Moon / No Moon (0% lit): No illuminated arc
    if (normalizedPhase < 0.02 || normalizedPhase > 0.98) {
        return (
            <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className="drop-shadow-[0_0_16px_rgba(15,23,42,0.6)]" aria-hidden>
                <defs>
                    <radialGradient id="moon-dark" cx="40%" cy="35%">
                        <stop offset="0%" stopColor="#334155" />
                        <stop offset="60%" stopColor="#1e293b" />
                        <stop offset="100%" stopColor="#090d16" />
                    </radialGradient>
                </defs>
                <g transform={`rotate(${rotation} ${r} ${r})`}>
                    <circle cx={r} cy={r} r={r} fill="url(#moon-dark)" />
                    <circle cx={r * 0.7} cy={r * 0.8} r={r * 0.18} fill="#0f172a" opacity="0.4" />
                    <circle cx={r * 1.3} cy={r * 1.2} r={r * 0.22} fill="#0f172a" opacity="0.3" />
                    <circle cx={r * 1.1} cy={r * 0.6} r={r * 0.14} fill="#0f172a" opacity="0.35" />
                    <circle cx={r} cy={r} r={r - 0.5} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
                </g>
            </svg>
        );
    }

    // Full Moon (100% lit): Fully illuminated golden circle
    if (normalizedPhase >= 0.485 && normalizedPhase <= 0.515) {
        return (
            <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className="drop-shadow-[0_0_24px_rgba(250,204,21,0.45)]" aria-hidden>
                <defs>
                    <radialGradient id="moon-full" cx="35%" cy="35%">
                        <stop offset="0%" stopColor="#fefce8" />
                        <stop offset="50%" stopColor="#fde68a" />
                        <stop offset="100%" stopColor="#f59e0b" />
                    </radialGradient>
                </defs>
                <g transform={`rotate(${rotation} ${r} ${r})`}>
                    <circle cx={r} cy={r} r={r} fill="url(#moon-full)" />
                    <circle cx={r - 0.5} cy={r} r={r - 0.5} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                </g>
            </svg>
        );
    }

    // Intermediate phases: Crescent / Gibbous / Quarter
    const rx = Math.abs(Math.cos(2 * Math.PI * normalizedPhase)) * r;
    let d = '';

    if (normalizedPhase < 0.5) {
        // Waxing (Right side illuminated)
        if (normalizedPhase < 0.25) {
            // Crescent: sweep=0 on inner terminator
            d = `M ${r} 0 A ${r} ${r} 0 0 1 ${r} ${size} A ${rx} ${r} 0 0 0 ${r} 0 Z`;
        } else {
            // Gibbous: sweep=1 on inner terminator
            d = `M ${r} 0 A ${r} ${r} 0 0 1 ${r} ${size} A ${rx} ${r} 0 0 1 ${r} 0 Z`;
        }
    } else {
        // Waning (Left side illuminated)
        if (normalizedPhase < 0.75) {
            // Gibbous: sweep=1 on inner terminator
            d = `M ${r} 0 A ${r} ${r} 0 0 0 ${r} ${size} A ${rx} ${r} 0 0 1 ${r} 0 Z`;
        } else {
            // Crescent: sweep=0 on inner terminator
            d = `M ${r} 0 A ${r} ${r} 0 0 0 ${r} ${size} A ${rx} ${r} 0 0 0 ${r} 0 Z`;
        }
    }

    return (
        <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className="drop-shadow-[0_0_20px_rgba(250,204,21,0.25)]" aria-hidden>
            <defs>
                <radialGradient id="moon-dark" cx="40%" cy="35%">
                    <stop offset="0%" stopColor="#334155" />
                    <stop offset="60%" stopColor="#1e293b" />
                    <stop offset="100%" stopColor="#090d16" />
                </radialGradient>
                <radialGradient id="moon-lit" cx="35%" cy="35%">
                    <stop offset="0%" stopColor="#fefce8" />
                    <stop offset="55%" stopColor="#fde68a" />
                    <stop offset="100%" stopColor="#f59e0b" />
                </radialGradient>
            </defs>
            <g transform={`rotate(${rotation} ${r} ${r})`}>
                <circle cx={r} cy={r} r={r} fill="url(#moon-dark)" />
                <path d={d} fill="url(#moon-lit)" />
                <circle cx={r} cy={r} r={r - 0.5} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
            </g>
        </svg>
    );
});

export function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: ReactNode; label: string }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                active
                    ? "bg-white dark:bg-neutral-800 text-teal-600 dark:text-teal-400 shadow-xs"
                    : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            )}
        >
            {icon}
            {label}
        </button>
    );
}

export function DetailRow({ khmer, english, value }: { khmer?: string; english: string; value: string }) {
    return (
        <>
            <dt className="flex flex-col justify-center py-2 border-b border-neutral-100 dark:border-white/5">
                {khmer && (
                    <span className="font-kantumruy text-sm text-neutral-700 dark:text-neutral-300 leading-none">{khmer}</span>
                )}
                <span className={cn("text-[9px] uppercase tracking-widest text-neutral-400", khmer && "mt-1")}>{english}</span>
            </dt>
            <dd className="text-neutral-900 dark:text-neutral-100 font-semibold text-right py-2 border-b border-neutral-100 dark:border-white/5 font-kantumruy leading-snug">
                {value}
            </dd>
        </>
    );
}

export function ActionButton({ onClick, icon, label, success }: { onClick: () => void; icon: ReactNode; label: string; success?: boolean }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border",
                success
                    ? "bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-500/40"
                    : "bg-white dark:bg-white/5 text-neutral-700 dark:text-neutral-200 border-neutral-200 dark:border-white/10 hover:bg-neutral-50 dark:hover:bg-white/10 hover:border-teal-500/40 hover:text-teal-600 dark:hover:text-teal-400"
            )}
        >
            {icon}
            {label}
        </button>
    );
}

export interface DateDetailPopupProps {
    selectedDate: Date | null;
    holiday: PublicHoliday | undefined;
    locale: string;
    intlFormatters: {
        weekdayShort: Intl.DateTimeFormat;
        weekdayLong: Intl.DateTimeFormat;
        monthLong: Intl.DateTimeFormat;
        fullDate: Intl.DateTimeFormat;
    };
    onClose: () => void;
}

export const DateDetailPopup = memo(function DateDetailPopup({
    selectedDate,
    holiday,
    locale,
    intlFormatters,
    onClose,
}: DateDetailPopupProps) {
    const [tab, setTab] = useState<PopupTab>('lunar');
    const [copied, setCopied] = useState<'copy' | 'share' | null>(null);

    useEffect(() => {
        if (!selectedDate) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', onKey);
        return () => {
            document.body.style.overflow = prevOverflow;
            window.removeEventListener('keydown', onKey);
        };
    }, [selectedDate, onClose]);

    const lunarStrings = useMemo(() => {
        if (!selectedDate) return null;
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
            full: safe('ថ្ងៃlW ldlN ខែlM ឆ្នាំlA lE ព.ស. BBBB គ.ស. YYYY, ត្រូវនឹងថ្ងៃទីdd ខែMMMM ឆ្នាំYYYY', '—'),
        };
    }, [selectedDate, locale]);

    // Parse Khmer lunar day (dayNum + waxing/waning) from the format string. This is the
    // single source of truth for the moon graphic — the popup no longer uses an astronomical
    // calculation, so the visual always matches the Khmer lunar date shown in the header.
    const khmerLunar = useMemo(() => {
        return lunarStrings ? parseKhmerLunarDay(lunarStrings.day) : null;
    }, [lunarStrings]);

    // Strictly check Khmer lunar dates for ថ្ងៃសីល (Buddhist Holy Day):
    // ១. ពេញបូណ៌មី: ១៥កើត
    // ២. កន្លះខែកើត: ៨កើត
    // ៣. កន្លះខែរោច: ៨រោច
    // ៤. ដាច់ខែ: ១៥រោច ឬ ១៤រោច (ខែខ្វះ)
    // ១កើត គឺមិនមែនជាថ្ងៃសីលទេ!
    const isFullMoon = useMemo(() => {
        if (!lunarStrings) return false;
        return (
            lunarStrings.day.includes('១៥កើត') ||
            (lunarStrings.day === '១៥' && lunarStrings.full.includes('កើត'))
        );
    }, [lunarStrings]);

    const isHalfMoonWaxing = useMemo(() => {
        if (!lunarStrings) return false;
        return (
            lunarStrings.day.includes('៨កើត') ||
            (lunarStrings.day === '៨' && lunarStrings.full.includes('កើត'))
        );
    }, [lunarStrings]);

    const isHalfMoonWaning = useMemo(() => {
        if (!lunarStrings) return false;
        return (
            lunarStrings.day.includes('៨រោច') ||
            (lunarStrings.day === '៨' && lunarStrings.full.includes('រោច'))
        );
    }, [lunarStrings]);

    const isNewMoon = useMemo(() => {
        if (!selectedDate || !lunarStrings) return false;
        const day = lunarStrings.day;
        if (day.includes('១៥រោច') || (day === '១៥' && lunarStrings.full.includes('រោច'))) {
            return true;
        }
        if (day.includes('១៤រោច') || (day === '១៤' && lunarStrings.full.includes('រោច'))) {
            // Check if tomorrow is 1កើត (meaning this is a 29-day month and 14រោច is the last day)
            try {
                const nextDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() + 1);
                const nextFmt = new FormatDateTime(nextDay, 'ldlN', locale).formatDate();
                return nextFmt.includes('១កើត') || nextFmt.includes('1កើត');
            } catch {
                return true;
            }
        }
        return false;
    }, [selectedDate, lunarStrings, locale]);

    const phaseName = useMemo(() => {
        if (isFullMoon) return 'Full Moon';
        if (isNewMoon) return 'New Moon';
        if (!khmerLunar) return 'Unknown';
        return khmerPhaseNameFor(khmerLunar.dayNum, khmerLunar.isWaxing);
    }, [khmerLunar, isFullMoon, isNewMoon]);

    const isHalfMoon = isHalfMoonWaxing || isHalfMoonWaning;

    // Buddhist Holy Day (ថ្ងៃសីល): ៨កើត, ១៥កើត, ៨រោច, ១៥រោច/១៤រោច (ដាច់ខែ)
    const isBuddhistHolyDay = useMemo(() => {
        return isFullMoon || isNewMoon || isHalfMoon;
    }, [isFullMoon, isNewMoon, isHalfMoon]);

    const holyDayLabel = useMemo(() => {
        if (isFullMoon) return 'ថ្ងៃសីល (១៥កើត ពេញបូណ៌មី)';
        if (isNewMoon) {
            if (lunarStrings?.day.includes('១៤') || lunarStrings?.day === '១៤') {
                return 'ថ្ងៃសីល (១៤រោច ដាច់ខែ)';
            }
            return 'ថ្ងៃសីល (១៥រោច ដាច់ខែ)';
        }
        if (isHalfMoonWaxing) return 'ថ្ងៃសីល (៨កើត)';
        if (isHalfMoonWaning) return 'ថ្ងៃសីល (៨រោច)';
        return 'ថ្ងៃសីល (Buddhist Holy Day)';
    }, [isFullMoon, isNewMoon, isHalfMoonWaxing, isHalfMoonWaning, lunarStrings]);

    // Moon graphic phase, driven by the Khmer lunar day (never by the astronomical calc).
    // Snap exactly to 0 / 0.5 for detected new / full moons so the 14 រោច short-month case
    // and any locale-parsing edge still render a clean disk.
    const graphicPhase = useMemo(() => {
        if (isFullMoon) return 0.5;
        if (isNewMoon) return 0;
        if (!khmerLunar) return 0;
        return khmerLunarPhaseValue(khmerLunar.dayNum, khmerLunar.isWaxing);
    }, [khmerLunar, isFullMoon, isNewMoon]);

    const dateKey = selectedDate ? formatDateKey(selectedDate) : '';
    const khmerHolidayName = holiday ? KHMER_HOLIDAY_NAMES[holiday.name] : undefined;
    const shortKhmerHolidayName = holiday ? SHORT_KHMER_HOLIDAY_NAMES[holiday.name] : undefined;
    const hasHoliday = !!holiday;
    // Fall back to lunar when the previously selected tab is 'holiday' but the new date has none.
    const activeTab: PopupTab = tab === 'holiday' && !hasHoliday ? 'lunar' : tab;
    const isSunday = selectedDate?.getDay() === 0;
    const isSaturday = selectedDate?.getDay() === 6;
    const isRedDay = hasHoliday || isSunday;

    const handleCopy = useCallback(async () => {
        if (!selectedDate || !lunarStrings) return;
        const text = `${intlFormatters.fullDate.format(selectedDate)}\n${lunarStrings.full}${holiday ? `\n${holiday.name}${khmerHolidayName ? ` — ${khmerHolidayName}` : ''}` : ''}`;
        try {
            await navigator.clipboard.writeText(text);
            setCopied('copy');
            setTimeout(() => setCopied(null), 1800);
        } catch { /* clipboard unavailable */ }
    }, [selectedDate, lunarStrings, intlFormatters, holiday, khmerHolidayName]);

    const handleICS = useCallback(() => {
        if (!selectedDate || !lunarStrings) return;
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
        if (!selectedDate || typeof window === 'undefined') return;
        const url = `${window.location.origin}${window.location.pathname}?date=${dateKey}`;
        const title = holiday?.name || intlFormatters.fullDate.format(selectedDate);
        const text = lunarStrings?.full || '';
        if (typeof navigator.share === 'function') {
            try {
                await navigator.share({ title, text, url });
                return;
            } catch { /* user cancelled or unsupported; fall through */ }
        }
        try {
            await navigator.clipboard.writeText(url);
            setCopied('share');
            setTimeout(() => setCopied(null), 1800);
        } catch { /* clipboard unavailable */ }
    }, [selectedDate, holiday, intlFormatters, dateKey, lunarStrings]);

    return (
        <div
            className={cn(
                "fixed inset-0 z-100 flex items-end justify-center sm:items-center p-0 sm:p-4 transition-all duration-300",
                selectedDate ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            )}
            role="dialog"
            aria-modal={!!selectedDate}
            aria-label="Date and holiday details"
        >
            <div
                className={cn(
                    "absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300",
                    selectedDate ? "opacity-100" : "opacity-0"
                )}
                onClick={onClose}
            />

            <div
                className={cn(
                    "relative w-full sm:w-130 max-h-[92vh] flex flex-col overflow-hidden bg-white/95 dark:bg-neutral-900/95 backdrop-blur-2xl border-t sm:border border-neutral-200 dark:border-white/10 sm:rounded-3xl rounded-t-3xl shadow-2xl transition-all duration-300 ease-out pointer-events-auto",
                    selectedDate ? "translate-y-0 scale-100" : "translate-y-full sm:translate-y-8 sm:scale-95 opacity-0"
                )}
            >
                <div className="sm:hidden w-12 h-1.5 rounded-full bg-neutral-300 dark:bg-white/20 mx-auto mt-3 mb-1 shrink-0" />

                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close details"
                    className="absolute top-3 right-3 z-20 p-2 rounded-xl bg-white/60 dark:bg-white/5 hover:bg-black/5 dark:hover:bg-white/10 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer backdrop-blur-md"
                >
                    <X className="w-4 h-4" />
                </button>

                {selectedDate && lunarStrings && (
                    <>
                        {/* Hero */}
                        <div className="relative px-6 pt-8 pb-5 flex flex-col items-center overflow-hidden shrink-0">
                            <div className="absolute inset-0 pointer-events-none" aria-hidden>
                                <div
                                    className="absolute -top-16 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-3xl opacity-70"
                                    style={{
                                        background: isRedDay
                                            ? 'radial-gradient(circle, rgb(244 63 94 / 0.30), transparent 65%)'
                                            : isSaturday
                                                ? 'radial-gradient(circle, rgb(245 158 11 / 0.30), transparent 65%)'
                                                : 'radial-gradient(circle, rgb(45 212 191 / 0.28), transparent 65%)'
                                    }}
                                />
                            </div>

                            <div className="relative">
                                <MoonPhaseGraphic phase={graphicPhase} size={88}/>
                            </div>

                            <div className="relative mt-4 text-center max-w-full">
                                <p className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white font-kantumruy leading-snug px-4">
                                    {lunarStrings.full}
                                </p>
                                <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1.5 font-medium">
                                    {intlFormatters.fullDate.format(selectedDate)}
                                </p>
                                <div className="flex items-center justify-center gap-2 mt-2.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                                    <span className="inline-flex items-center gap-1"><Moon className="w-3 h-3" /> {phaseName}</span>
                                    <span className="w-1 h-1 rounded-full bg-neutral-300 dark:bg-neutral-600" />
                                    <span className="font-kantumruy normal-case tracking-normal text-xs text-neutral-700 dark:text-neutral-300">
                                        {lunarStrings.day}
                                    </span>
                                </div>

                                {/* Buddhist Holy Day Badge (ថ្ងៃសីល: ៨កើត, ១៥កើត, ៨រោច, ១៥រោច/១៤រោច) */}
                                {isBuddhistHolyDay && (
                                    <div className="mt-3 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-200 shadow-sm backdrop-blur-md">
                                        <img 
                                            src="/buddha.png" 
                                            alt="ថ្ងៃសីល" 
                                            className="w-4 h-4 sm:w-5 sm:h-5 object-contain shrink-0" 
                                        />
                                        <span className="text-xs sm:text-sm font-bold font-kantumruy leading-none">
                                            {holyDayLabel}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {hasHoliday && (
                                <div className="relative mt-4 w-full flex items-center gap-2.5 px-3 py-2 rounded-2xl bg-linear-to-r from-rose-500/10 via-amber-500/10 to-rose-500/10 border border-rose-500/25">
                                    <div className="p-1.5 rounded-lg bg-rose-500/20 shrink-0">
                                        <Sparkles className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 leading-none">
                                            Official Public Holiday
                                        </p>
                                        <p className="text-sm font-bold text-neutral-900 dark:text-white truncate mt-0.5">
                                            {holiday!.name}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Tabs */}
                        <div className="px-4 sm:px-6 shrink-0">
                            <div className="flex items-center gap-1 p-1 bg-neutral-100/80 dark:bg-white/5 rounded-xl border border-neutral-200/50 dark:border-white/5">
                                <TabButton active={activeTab === 'lunar'} onClick={() => setTab('lunar')} icon={<MoonStar className="w-3.5 h-3.5" />} label="Lunar" />
                                <TabButton active={activeTab === 'gregorian'} onClick={() => setTab('gregorian')} icon={<Globe className="w-3.5 h-3.5" />} label="Gregorian" />
                                {hasHoliday && (
                                    <TabButton active={activeTab === 'holiday'} onClick={() => setTab('holiday')} icon={<Sparkles className="w-3.5 h-3.5" />} label="Holiday" />
                                )}
                            </div>
                        </div>

                        {/* Tab content */}
                        <div className="px-4 sm:px-6 pt-4 pb-4 flex-1 overflow-y-auto min-h-45">
                            {activeTab === 'lunar' && (
                                <dl className="grid grid-cols-[minmax(88px,auto)_1fr] gap-x-4 text-sm">
                                    <DetailRow khmer="ថ្ងៃ" english="Weekday" value={lunarStrings.weekday} />
                                    <DetailRow khmer="ទី" english="Day / Phase" value={lunarStrings.day} />
                                    {isBuddhistHolyDay && (
                                        <DetailRow khmer="ឧបោសថ" english="Holy Day" value={holyDayLabel} />
                                    )}
                                    <DetailRow khmer="ខែ" english="Month" value={lunarStrings.month} />
                                    <DetailRow khmer="ឆ្នាំ" english="Year (Animal)" value={lunarStrings.year} />
                                    <DetailRow khmer="ព.ស." english="Buddhist Era" value={lunarStrings.era} />
                                </dl>
                            )}
                            {activeTab === 'gregorian' && (
                                <dl className="grid grid-cols-[minmax(88px,auto)_1fr] gap-x-4 text-sm">
                                    <DetailRow english="Weekday" value={intlFormatters.weekdayLong.format(selectedDate)} />
                                    <DetailRow english="Day" value={String(selectedDate.getDate()).padStart(2, '0')} />
                                    <DetailRow english="Month" value={intlFormatters.monthLong.format(selectedDate)} />
                                    <DetailRow english="Year" value={String(selectedDate.getFullYear())} />
                                    <DetailRow english="ISO Date" value={dateKey} />
                                </dl>
                            )}
                            {activeTab === 'holiday' && holiday && (
                                <div className="space-y-3 text-sm">
                                    <div>
                                        <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 mb-1">Name</p>
                                        <p className="font-bold text-neutral-900 dark:text-white">{holiday.name}</p>
                                        {khmerHolidayName && (
                                            <p className="text-teal-600 dark:text-teal-400 font-kantumruy mt-0.5 leading-snug">{khmerHolidayName}</p>
                                        )}
                                        {shortKhmerHolidayName && shortKhmerHolidayName !== khmerHolidayName && (
                                            <p className="text-xs text-neutral-500 mt-1">
                                                <span className="opacity-70">Short: </span>
                                                <span className="font-kantumruy">{shortKhmerHolidayName}</span>
                                            </p>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="p-2.5 rounded-xl bg-neutral-100/60 dark:bg-white/5 border border-neutral-200/50 dark:border-white/5">
                                            <p className="text-[9px] font-semibold uppercase tracking-wider text-neutral-500 mb-1">Country</p>
                                            <p className="font-mono text-xs font-bold">{holiday.countryCode}</p>
                                        </div>
                                        <div className="p-2.5 rounded-xl bg-neutral-100/60 dark:bg-white/5 border border-neutral-200/50 dark:border-white/5">
                                            <p className="text-[9px] font-semibold uppercase tracking-wider text-neutral-500 mb-1">National</p>
                                            <p className="text-xs font-bold">{holiday.nationalHoliday ? 'Yes' : 'No'}</p>
                                        </div>
                                        <div className="p-2.5 rounded-xl bg-neutral-100/60 dark:bg-white/5 border border-neutral-200/50 dark:border-white/5">
                                            <p className="text-[9px] font-semibold uppercase tracking-wider text-neutral-500 mb-1">ISO</p>
                                            <p className="font-mono text-[10px] font-bold">{holiday.date}</p>
                                        </div>
                                    </div>
                                    {holiday.holidayTypes?.length > 0 && (
                                        <div>
                                            <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 mb-1">Types</p>
                                            <div className="flex flex-wrap gap-1">
                                                {holiday.holidayTypes.map(t => (
                                                    <span key={t} className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20">{t}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="px-4 sm:px-6 py-3 border-t border-neutral-200/60 dark:border-white/10 bg-neutral-50/60 dark:bg-white/2 flex items-center gap-2 shrink-0">
                            <ActionButton
                                onClick={handleCopy}
                                icon={copied === 'copy' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                label={copied === 'copy' ? 'Copied' : 'Copy'}
                                success={copied === 'copy'}
                            />
                            <ActionButton
                                onClick={handleICS}
                                icon={<Download className="w-3.5 h-3.5" />}
                                label=".ics"
                            />
                            <ActionButton
                                onClick={handleShare}
                                icon={copied === 'share' ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                                label={copied === 'share' ? 'Copied' : 'Share'}
                                success={copied === 'share'}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
});

export default DateDetailPopup;
