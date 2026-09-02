'use client';

import { useState, useMemo, useEffect, useTransition, useCallback, memo, type ReactNode } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { FormatDateTime } from '@pphatdev/format-datetime';
import {
    ChevronLeft,
    ChevronRight,
    MoonStar,
    Moon,
    Globe,
    X,
    Calendar as CalendarIcon,
    Sparkles,
    Search,
    ArrowUpRight,
    CalendarDays,
    ListFilter,
    Copy,
    Check,
    Download,
    Share2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import {
    fetchCambodiaHolidays,
    formatDateKey,
    PublicHoliday,
    KHMER_HOLIDAY_NAMES,
    SHORT_KHMER_HOLIDAY_NAMES
} from '@/lib/holidays';

// Module-level cache for lunar computations. Keyed by locale → dateKey → { day, phase }.
// Persists across re-renders/nav; module scope keeps the ref out of render-time mutations.
const lunarCache = new Map<string, Map<string, { lunarDayNum: string; lunarPhase: string }>>();

interface CalendarCell {
    date: Date;
    dateKey: string;
    isCurrentMonth: boolean;
    isTodayCell: boolean;
    isSunday: boolean;
    isSaturday: boolean;
    isHolyDay: boolean;
    holiday: PublicHoliday | undefined;
    lunarDayNum: string;
    lunarPhase: string;
    isFullMoon: boolean;
    isNewMoon: boolean;
}

interface DayCellProps {
    cell: CalendarCell;
    onSelect: (date: Date) => void;
}

const DayCell = memo(function DayCell({ cell, onSelect }: DayCellProps) {
    const { date, isCurrentMonth, isTodayCell, isSunday, isSaturday, isHolyDay, holiday, lunarDayNum, lunarPhase, isFullMoon, isNewMoon } = cell;
    const hasHoliday = !!holiday;
    const isRedDay = isSunday || hasHoliday;
    const isYellowDay = isSaturday && !hasHoliday;
    const khmerHolidayName = holiday 
        ? (SHORT_KHMER_HOLIDAY_NAMES[holiday.name] || KHMER_HOLIDAY_NAMES[holiday.name] || holiday.name) 
        : '';
    const fullKhmerHolidayName = holiday 
        ? (KHMER_HOLIDAY_NAMES[holiday.name] || holiday.name) 
        : '';

    return (
        <div
            onClick={() => onSelect(date)}
            className={cn(
                "relative flex flex-col items-center justify-between p-1 sm:p-1.5 md:p-2 min-h-[64px] sm:min-h-[80px] md:min-h-[96px] rounded-xl sm:rounded-2xl border transition-all duration-200 group/cell overflow-hidden cursor-pointer",
                isCurrentMonth
                    ? isRedDay
                        ? "bg-rose-500/10 dark:bg-rose-500/15 border-rose-500/30 dark:border-rose-500/30 hover:border-rose-500 hover:bg-rose-500/20 hover:shadow-md hover:shadow-rose-500/15"
                        : isYellowDay
                            ? "bg-amber-500/10 dark:bg-amber-500/15 border-amber-500/30 dark:border-amber-500/30 hover:border-amber-500 hover:bg-amber-500/20 hover:shadow-md hover:shadow-amber-500/15"
                            : "bg-white/40 dark:bg-white/5 border-neutral-200/60 dark:border-white/5 hover:border-teal-500/30 hover:bg-teal-500/5 dark:hover:bg-teal-500/10 hover:shadow-md hover:shadow-teal-500/10"
                    : "bg-transparent border-transparent opacity-25",
                isTodayCell && "ring-2 ring-teal-500/60 border-teal-500/60 bg-teal-500/10 dark:bg-teal-500/20 shadow-sm shadow-teal-500/20"
            )}
        >
            {isCurrentMonth && isHolyDay ? (
                <div 
                    className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 z-20 flex items-center justify-center p-0.5 rounded-full bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/25 shadow-2xs backdrop-blur-xs" 
                    title="ថ្ងៃសីល (Buddhist Holy Day)"
                >
                    <img 
                        src="/buddha.png" 
                        alt="ថ្ងៃសីល" 
                        className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 object-contain" 
                    />
                </div>
            ) : (
                <>
                    {isCurrentMonth && isFullMoon && (
                        <div className="absolute top-1 right-1 sm:top-2 sm:right-2 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,1)]" title="Full Moon" />
                    )}
                    {isCurrentMonth && isNewMoon && (
                        <div className="absolute top-1 right-1 sm:top-2 sm:right-2 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-slate-800 dark:bg-slate-300 shadow-[0_0_8px_rgba(100,116,139,0.5)]" title="Dark Moon" />
                    )}
                </>
            )}
            {isCurrentMonth && hasHoliday && (
                <div className="absolute top-1 left-1 sm:top-2 sm:left-2 flex items-center gap-0.5 text-rose-600 dark:text-rose-400" title={`${fullKhmerHolidayName} (${holiday?.name})`}>
                    <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-rose-500/20" />
                </div>
            )}
            <span className={cn(
                "text-xs sm:text-base md:text-xl font-bold z-10 leading-tight",
                isRedDay
                    ? isCurrentMonth
                        ? "text-rose-600 dark:text-rose-400 font-extrabold"
                        : "text-rose-400/40 dark:text-rose-400/30"
                    : isYellowDay
                        ? isCurrentMonth
                            ? "text-amber-600 dark:text-amber-400 font-extrabold"
                            : "text-amber-400/40 dark:text-amber-400/30"
                        : isTodayCell 
                            ? "text-teal-700 dark:text-teal-400" 
                            : isCurrentMonth 
                                ? "text-neutral-900 dark:text-neutral-100" 
                                : "text-neutral-500"
            )}>
                {date.getDate()}
            </span>
            <div className="flex flex-col items-center z-10 max-w-full px-0.5 my-0.5">
                <span className={cn(
                    "text-[9px] sm:text-[11px] md:text-xs font-medium leading-none font-[family-name:var(--font-kantumruy)]",
                    isRedDay
                        ? isCurrentMonth
                            ? "text-rose-600 dark:text-rose-400 font-bold"
                            : "text-rose-400/30"
                        : isYellowDay
                            ? isCurrentMonth
                                ? "text-amber-600 dark:text-amber-400 font-bold"
                                : "text-amber-400/30"
                            : isCurrentMonth 
                                ? "text-teal-600 dark:text-teal-400" 
                                : "text-neutral-400/50"
                )}>
                    {lunarDayNum}
                </span>
                <span className={cn(
                    "text-[7px] sm:text-[9px] md:text-[10px] mt-0.5 font-[family-name:var(--font-kantumruy)] truncate max-w-full text-center leading-none",
                    isRedDay
                        ? isCurrentMonth
                            ? "text-rose-600/80 dark:text-rose-400/80 font-medium"
                            : "text-rose-400/25"
                        : isYellowDay
                            ? isCurrentMonth
                                ? "text-amber-600/80 dark:text-amber-400/80 font-medium"
                                : "text-amber-400/25"
                            : isCurrentMonth 
                                ? "text-neutral-500 dark:text-neutral-400" 
                                : "text-neutral-400/40"
                )}>
                    {lunarPhase}
                </span>
            </div>
            {isCurrentMonth && hasHoliday ? (
                <div 
                    className="w-full mt-0.5 px-1 py-0.5 rounded-md bg-rose-500/15 dark:bg-rose-500/25 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-[7px] sm:text-[8px] md:text-[9.5px] font-bold font-[family-name:var(--font-kantumruy)] truncate text-center leading-tight shadow-2xs z-10"
                    title={`${fullKhmerHolidayName} (${holiday?.name})`}
                >
                    {khmerHolidayName}
                </div>
            ) : (
                <div className="h-1.5 sm:h-2" />
            )}
            <div className="absolute inset-0 bg-linear-to-b from-transparent to-teal-500/5 opacity-0 group-hover/cell:opacity-100 rounded-xl sm:rounded-2xl transition-opacity pointer-events-none" />
        </div>
    );
});


type PopupTab = 'lunar' | 'gregorian' | 'holiday';

// Parse a Khmer lunar day string in `ldlN` format (e.g. "១៥កើត", "៨រោច") or Arabic-numeral
// equivalents ("15កើត"). Returns { dayNum: 1..15, isWaxing } or null when unparseable.
const KHMER_DIGITS: Record<string, string> = {
    '០': '0', '១': '1', '២': '2', '៣': '3', '៤': '4',
    '៥': '5', '៦': '6', '៧': '7', '៨': '8', '៩': '9',
};
function parseKhmerLunarDay(dayStr: string): { dayNum: number; isWaxing: boolean } | null {
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
function khmerPhaseNameFor(dayNum: number, isWaxing: boolean): string {
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
function khmerLunarPhaseValue(dayNum: number, isWaxing: boolean): number {
    // 30-day lunar month split: waxing 1..15 → 1/30..15/30 (=0.5=full)
    //                          waning 1..15 → 16/30..30/30 (≈1=new)
    return isWaxing ? dayNum / 30 : 0.5 + dayNum / 30;
}

const MoonPhaseGraphic = memo(function MoonPhaseGraphic({ 
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
                    <circle cx={r} cy={r} r={r - 0.5} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
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

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: ReactNode; label: string }) {
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

function DetailRow({ khmer, english, value }: { khmer?: string; english: string; value: string }) {
    return (
        <>
            <dt className="flex flex-col justify-center py-2 border-b border-neutral-100 dark:border-white/5">
                {khmer && (
                    <span className="font-[family-name:var(--font-kantumruy)] text-sm text-neutral-700 dark:text-neutral-300 leading-none">{khmer}</span>
                )}
                <span className={cn("text-[9px] uppercase tracking-widest text-neutral-400", khmer && "mt-1")}>{english}</span>
            </dt>
            <dd className="text-neutral-900 dark:text-neutral-100 font-semibold text-right py-2 border-b border-neutral-100 dark:border-white/5 font-[family-name:var(--font-kantumruy)] leading-snug">
                {value}
            </dd>
        </>
    );
}

function ActionButton({ onClick, icon, label, success }: { onClick: () => void; icon: ReactNode; label: string; success?: boolean }) {
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

interface DateDetailPopupProps {
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

const DateDetailPopup = memo(function DateDetailPopup({
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
            full: safe('ថ្ងៃlW ldlN ខែlM ឆ្នាំlA lE ព.ស. BBBB', '—'),
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
                "fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-0 sm:p-4 transition-all duration-300",
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
                    "relative w-full sm:w-[520px] max-h-[92vh] flex flex-col overflow-hidden bg-white/95 dark:bg-neutral-900/95 backdrop-blur-2xl border-t sm:border border-neutral-200 dark:border-white/10 sm:rounded-3xl rounded-t-3xl shadow-2xl transition-all duration-300 ease-out pointer-events-auto",
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
                                <p className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white font-[family-name:var(--font-kantumruy)] leading-snug px-4">
                                    {lunarStrings.full}
                                </p>
                                <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1.5 font-medium">
                                    {intlFormatters.fullDate.format(selectedDate)}
                                </p>
                                <div className="flex items-center justify-center gap-2 mt-2.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                                    <span className="inline-flex items-center gap-1"><Moon className="w-3 h-3" /> {phaseName}</span>
                                    <span className="w-1 h-1 rounded-full bg-neutral-300 dark:bg-neutral-600" />
                                    <span className="font-[family-name:var(--font-kantumruy)] normal-case tracking-normal text-xs text-neutral-700 dark:text-neutral-300">
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
                                        <span className="text-xs sm:text-sm font-bold font-[family-name:var(--font-kantumruy)] leading-none">
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
                        <div className="px-4 sm:px-6 pt-4 pb-4 flex-1 overflow-y-auto min-h-[180px]">
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
                                            <p className="text-teal-600 dark:text-teal-400 font-[family-name:var(--font-kantumruy)] mt-0.5 leading-snug">{khmerHolidayName}</p>
                                        )}
                                        {shortKhmerHolidayName && shortKhmerHolidayName !== khmerHolidayName && (
                                            <p className="text-xs text-neutral-500 mt-1">
                                                <span className="opacity-70">Short: </span>
                                                <span className="font-[family-name:var(--font-kantumruy)]">{shortKhmerHolidayName}</span>
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
                        <div className="px-4 sm:px-6 py-3 border-t border-neutral-200/60 dark:border-white/10 bg-neutral-50/60 dark:bg-white/[0.02] flex items-center gap-2 shrink-0">
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

// ─── Main widget ─────────────────────────────────────────────────────────────

export function LunarCalendarWidget() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Parse initial date from URL parameters (?year=2026&month=4 or ?date=2026-04-14)
    const [currentDate, setCurrentDate] = useState<Date>(() => {
        const now = new Date();
        const dateParam = searchParams.get('date');
        const yearParam = searchParams.get('year');
        const monthParam = searchParams.get('month');

        if (dateParam) {
            const [y, m, d] = dateParam.split('-').map(Number);
            if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
                return new Date(y, m - 1, d);
            }
        }
        if (yearParam || monthParam) {
            const y = yearParam ? parseInt(yearParam, 10) : now.getFullYear();
            let m = now.getMonth();
            if (monthParam) {
                if (monthParam.includes('-')) {
                    m = parseInt(monthParam.split('-')[1], 10) - 1;
                } else {
                    m = parseInt(monthParam, 10) - 1;
                }
            }
            if (!isNaN(y) && !isNaN(m) && m >= 0 && m <= 11) {
                return new Date(y, m, 1);
            }
        }
        return now;
    });

    const [mounted, setMounted] = useState(false);
    const [locale, setLocale] = useState(() => searchParams.get('locale') || 'km-KH');
    const [selectedDate, setSelectedDate] = useState<Date | null>(() => {
        const dateParam = searchParams.get('date');
        if (dateParam) {
            const [y, m, d] = dateParam.split('-').map(Number);
            if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
                return new Date(y, m - 1, d);
            }
        }
        return null;
    });
    const [holidays, setHolidays] = useState<PublicHoliday[]>([]);
    const [activeTab, setActiveTab] = useState<'calendar' | 'holidays'>(() => {
        return searchParams.get('tab') === 'holidays' ? 'holidays' : 'calendar';
    });
    const [holidaySearch, setHolidaySearch] = useState('');
    const [isPending, startTransition] = useTransition();

    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    useEffect(() => {
        setMounted(true);
    }, []);

    // Sync URL search params helper
    const updateUrlParams = useCallback((targetDate: Date, tabName?: string, selDate?: Date | null, loc?: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('year', String(targetDate.getFullYear()));
        params.set('month', String(targetDate.getMonth() + 1)); // 1-indexed

        if (selDate) {
            params.set('date', formatDateKey(selDate));
        } else {
            params.delete('date');
        }

        if (tabName && tabName !== 'calendar') {
            params.set('tab', tabName);
        } else {
            params.delete('tab');
        }

        if (loc && loc !== 'km-KH') {
            params.set('locale', loc);
        } else {
            params.delete('locale');
        }

        const queryString = params.toString();
        router.replace(`${pathname}${queryString ? `?${queryString}` : ''}`, { scroll: false });
    }, [pathname, router, searchParams]);

    // Handle browser back/forward or external URL changes
    useEffect(() => {
        const dateParam = searchParams.get('date');
        const yearParam = searchParams.get('year');
        const monthParam = searchParams.get('month');
        const tabParam = searchParams.get('tab');
        const localeParam = searchParams.get('locale');

        if (localeParam && localeParam !== locale) {
            setLocale(localeParam);
        }
        if (tabParam === 'holidays' || tabParam === 'calendar') {
            setActiveTab(tabParam);
        }

        if (dateParam) {
            const [y, m, d] = dateParam.split('-').map(Number);
            if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
                const target = new Date(y, m - 1, d);
                setCurrentDate(target);
                setSelectedDate(target);
                return;
            }
        }

        if (yearParam || monthParam) {
            const y = yearParam ? parseInt(yearParam, 10) : currentDate.getFullYear();
            let m = currentDate.getMonth();
            if (monthParam) {
                if (monthParam.includes('-')) {
                    m = parseInt(monthParam.split('-')[1], 10) - 1;
                } else {
                    m = parseInt(monthParam, 10) - 1;
                }
            }
            if (!isNaN(y) && !isNaN(m) && m >= 0 && m <= 11) {
                if (currentDate.getFullYear() !== y || currentDate.getMonth() !== m) {
                    setCurrentDate(new Date(y, m, 1));
                }
            }
        }
    }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

    // Fetch public holidays dynamically for the current year
    useEffect(() => {
        let isMounted = true;
        fetchCambodiaHolidays(currentYear)
            .then(data => {
                if (isMounted) {
                    setHolidays(data);
                }
            })
            .catch(() => {});

        return () => {
            isMounted = false;
        };
    }, [currentYear]);

    // Map holidays by YYYY-MM-DD for fast lookup
    const holidaysMap = useMemo(() => {
        const map = new Map<string, PublicHoliday>();
        for (const h of holidays) {
            map.set(h.date, h);
        }
        return map;
    }, [holidays]);

    // Holidays in current month
    const currentMonthHolidays = useMemo(() => {
        return holidays.filter(h => {
            const [y, m] = h.date.split('-').map(Number);
            return y === currentYear && m === currentMonth + 1;
        });
    }, [holidays, currentYear, currentMonth]);

    const todayKey = useMemo(() => formatDateKey(new Date()), []);

    const getLunarInfo = useCallback((date: Date, dateKey: string) => {
        let localeCache = lunarCache.get(locale);
        if (!localeCache) {
            localeCache = new Map();
            lunarCache.set(locale, localeCache);
        }
        const cached = localeCache.get(dateKey);
        if (cached) return cached;
        try {
            const fdt = new FormatDateTime(date, "ld|lN", locale);
            const [lunarDayNum, lunarPhase] = fdt.formatDate().split('|');
            const result = { lunarDayNum, lunarPhase };
            localeCache.set(dateKey, result);
            return result;
        } catch {
            const result = { lunarDayNum: "?", lunarPhase: "" };
            localeCache.set(dateKey, result);
            return result;
        }
    }, [locale]);

    const calendarData = useMemo<CalendarCell[]>(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();
        const previousMonthLastDay = new Date(year, month, 0).getDate();

        const days: CalendarCell[] = [];

        const buildCell = (date: Date, isCurrentMonth: boolean): CalendarCell => {
            const dateKey = formatDateKey(date);
            const { lunarDayNum, lunarPhase } = getLunarInfo(date, dateKey);
            const isFullMoon = lunarDayNum === "១៥" && lunarPhase.includes("កើត");
            let isNewMoon = lunarDayNum === "១៥" && lunarPhase.includes("រោច");
            if (!isNewMoon && lunarDayNum === "១៤" && lunarPhase.includes("រោច")) {
                const nextDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
                const nextDateKey = formatDateKey(nextDate);
                const nextLunar = getLunarInfo(nextDate, nextDateKey);
                if (nextLunar.lunarDayNum === "១" && nextLunar.lunarPhase.includes("កើត")) {
                    isNewMoon = true;
                }
            }
            const isHalfMoonWaxing = lunarDayNum === "៨" && lunarPhase.includes("កើត");
            const isHalfMoonWaning = lunarDayNum === "៨" && lunarPhase.includes("រោច");
            const isHolyDay = isFullMoon || isNewMoon || isHalfMoonWaxing || isHalfMoonWaning;

            return {
                date,
                dateKey,
                isCurrentMonth,
                isTodayCell: dateKey === todayKey,
                isSunday: date.getDay() === 0,
                isSaturday: date.getDay() === 6,
                isHolyDay,
                holiday: holidaysMap.get(dateKey),
                lunarDayNum,
                lunarPhase,
                isFullMoon,
                isNewMoon,
            };
        };

        for (let i = startingDayOfWeek - 1; i >= 0; i--) {
            days.push(buildCell(new Date(year, month - 1, previousMonthLastDay - i), false));
        }
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(buildCell(new Date(year, month, i), true));
        }
        const remainingCells = 42 - days.length;
        for (let i = 1; i <= remainingCells; i++) {
            days.push(buildCell(new Date(year, month + 1, i), false));
        }

        return days;
    }, [currentDate, holidaysMap, getLunarInfo, todayKey]);

    const handleSelectDate = useCallback((date: Date) => {
        setSelectedDate(date);
        updateUrlParams(currentDate, activeTab, date, locale);
    }, [currentDate, activeTab, locale, updateUrlParams]);

    const nextMonth = useCallback(() => {
        startTransition(() => {
            const next = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
            setCurrentDate(next);
            updateUrlParams(next, activeTab, selectedDate, locale);
        });
    }, [currentDate, activeTab, selectedDate, locale, updateUrlParams]);

    const prevMonth = useCallback(() => {
        startTransition(() => {
            const prev = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
            setCurrentDate(prev);
            updateUrlParams(prev, activeTab, selectedDate, locale);
        });
    }, [currentDate, activeTab, selectedDate, locale, updateUrlParams]);

    const jumpToToday = useCallback(() => {
        startTransition(() => {
            const now = new Date();
            setCurrentDate(now);
            setSelectedDate(now);
            updateUrlParams(now, activeTab, now, locale);
        });
    }, [activeTab, locale, updateUrlParams]);

    const jumpToDate = useCallback((dateStr: string) => {
        const [y, m, d] = dateStr.split('-').map(Number);
        const targetDate = new Date(y, m - 1, d);
        startTransition(() => {
            setCurrentDate(targetDate);
            setSelectedDate(targetDate);
            setActiveTab('calendar');
            updateUrlParams(targetDate, 'calendar', targetDate, locale);
        });
    }, [locale, updateUrlParams]);

    const handleTabChange = (tab: 'calendar' | 'holidays') => {
        setActiveTab(tab);
        updateUrlParams(currentDate, tab, selectedDate, locale);
    };

    const handleLocaleChange = (newLocale: string | null) => {
        const value = newLocale || 'km-KH';
        startTransition(() => {
            setLocale(value);
            updateUrlParams(currentDate, activeTab, selectedDate, value);
        });
    };

    const handleCloseDrawer = () => {
        setSelectedDate(null);
        updateUrlParams(currentDate, activeTab, null, locale);
    };

    // Allocate Intl formatters once per locale change (not per cell / per card).
    const intlFormatters = useMemo(() => ({
        monthLong: new Intl.DateTimeFormat(locale, { month: 'long' }),
        weekdayShort: new Intl.DateTimeFormat(locale, { weekday: 'short' }),
        weekdayLong: new Intl.DateTimeFormat(locale, { weekday: 'long' }),
        fullDate: new Intl.DateTimeFormat(locale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
    }), [locale]);

    const monthNames = useMemo(() => {
        return Array.from({ length: 12 }).map((_, i) => intlFormatters.monthLong.format(new Date(2000, i, 1)));
    }, [intlFormatters]);

    const weekDays = useMemo(() => {
        return Array.from({ length: 7 }).map((_, i) => intlFormatters.weekdayShort.format(new Date(2000, 0, 2 + i)));
    }, [intlFormatters]);



    const currentMonthLunarLabel = useMemo(() => {
        try {
            return new FormatDateTime(currentDate, "ឆ្នាំlA ព.ស. BBBB", locale).formatDate();
        } catch {
            return "Lunar Calendar";
        }
    }, [currentDate, locale]);

    const filteredHolidays = useMemo(() => {
        const query = holidaySearch.toLowerCase().trim();
        if (!query) return holidays;
        return holidays.filter(h => {
            const khmerName = KHMER_HOLIDAY_NAMES[h.name] || '';
            return (
                h.name.toLowerCase().includes(query) ||
                khmerName.toLowerCase().includes(query) ||
                h.date.includes(query)
            );
        });
    }, [holidays, holidaySearch]);

    const selectedDateKey = selectedDate ? formatDateKey(selectedDate) : null;
    const selectedDateHoliday = selectedDateKey ? holidaysMap.get(selectedDateKey) : null;

    if (!mounted) return null;

    return (
        <div className="w-full relative group">
            {/* Ambient Background Glow */}
            <div className="absolute -inset-0.5 bg-linear-to-r from-teal-500/30 via-purple-500/30 to-sky-500/30 rounded-3xl blur-2xl opacity-40 group-hover:opacity-70 transition duration-1000 group-hover:duration-200 pointer-events-none" />
            
            <div className="bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-3xl border border-neutral-200 dark:border-white/10 rounded-2xl sm:rounded-3xl p-3 sm:p-6 md:p-8 relative overflow-hidden flex flex-col w-full shadow-xl">
                
                {/* Top View Selector & Month Holiday Summary */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 pb-4 mb-4 border-b border-neutral-200/60 dark:border-white/10 relative z-10">
                    <div className="flex items-center gap-1.5 p-1 bg-neutral-100/80 dark:bg-white/5 rounded-xl border border-neutral-200/50 dark:border-white/5 backdrop-blur-md">
                        <button
                            type="button"
                            onClick={() => handleTabChange('calendar')}
                            className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer",
                                activeTab === 'calendar'
                                    ? "bg-white dark:bg-neutral-800 text-teal-600 dark:text-teal-400 shadow-xs"
                                    : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                            )}
                        >
                            <CalendarDays className="w-4 h-4" />
                            Calendar View
                        </button>
                        <button
                            type="button"
                            onClick={() => handleTabChange('holidays')}
                            className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer",
                                activeTab === 'holidays'
                                    ? "bg-white dark:bg-neutral-800 text-teal-600 dark:text-teal-400 shadow-xs"
                                    : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                            )}
                        >
                            <Sparkles className="w-4 h-4 text-rose-500" />
                            Public Holidays ({holidays.length})
                        </button>
                    </div>

                    {/* Quick Badge info */}
                    <div className="flex items-center gap-2">
                        {currentMonthHolidays.length > 0 ? (
                            <button
                                type="button"
                                onClick={() => handleTabChange('holidays')}
                                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-colors cursor-pointer"
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                                {currentMonthHolidays.length} Public Holiday{currentMonthHolidays.length > 1 ? 's' : ''} this month
                            </button>
                        ) : (
                            <span className="text-xs text-neutral-400 font-medium hidden sm:inline-block">
                                No public holidays in {monthNames[currentMonth]}
                            </span>
                        )}
                        <a
                            href={`https://nagerholidays.com/api/v4/Holidays/KH/${currentYear}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] text-neutral-400 dark:text-neutral-500 hover:text-teal-600 dark:hover:text-teal-400 transition-colors flex items-center gap-0.5"
                            title="Official Nager.Date Public Holiday API"
                        >
                            API: Nager.Date
                            <ArrowUpRight className="w-3 h-3 opacity-60" />
                        </a>
                    </div>
                </div>

                {activeTab === 'calendar' ? (
                    <>
                        {/* Responsive Header Controls */}
                        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-8 relative z-10">
                            {/* Month / Year & Lunar Tag */}
                            <div className="flex items-center gap-3">
                                <div className="p-2 sm:p-3 bg-teal-500/10 dark:bg-teal-500/20 rounded-xl sm:rounded-2xl border border-teal-500/20 shadow-inner shrink-0">
                                    <MoonStar className="w-5 h-5 sm:w-7 sm:h-7 text-teal-600 dark:text-teal-400" />
                                </div>
                                <div className="min-w-0">
                                    <h2 className="text-lg sm:text-2xl md:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight truncate">
                                        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                                    </h2>
                                    <p className="text-xs sm:text-sm font-medium text-teal-600 dark:text-teal-400 mt-0.5 font-[family-name:var(--font-kantumruy)] truncate">
                                        {currentMonthLunarLabel}
                                    </p>
                                </div>
                            </div>
                            
                            {/* Controls Row (Language + Prev/Today/Next) */}
                            <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto justify-between sm:justify-end">
                                <div className="w-1/2 sm:w-[150px]">
                                    <Select value={locale} onValueChange={handleLocaleChange}>
                                        <SelectTrigger className="w-full bg-neutral-100/80 dark:bg-white/5 border border-neutral-200/50 dark:border-white/10 text-neutral-900 dark:text-white rounded-xl backdrop-blur-md focus:ring-teal-500 focus:border-teal-500 font-medium text-xs sm:text-sm h-9 sm:h-10">
                                            <div className="flex items-center gap-1.5 truncate">
                                                <Globe className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                                                <SelectValue placeholder="Language" />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent className="z-[150]">
                                            <SelectItem value="km-KH">Khmer (km-KH)</SelectItem>
                                            <SelectItem value="en-US">English (en-US)</SelectItem>
                                            <SelectItem value="fr-FR">French (fr-FR)</SelectItem>
                                            <SelectItem value="zh-CN">Chinese (zh-CN)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex items-center gap-0.5 sm:gap-1 bg-neutral-100/80 dark:bg-white/5 p-1 rounded-xl sm:rounded-2xl border border-neutral-200/50 dark:border-white/5 backdrop-blur-md shrink-0">
                                    <button 
                                        type="button"
                                        onClick={prevMonth}
                                        aria-label="Previous Month"
                                        className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl hover:bg-white hover:shadow-sm dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-300 transition-all cursor-pointer"
                                    >
                                        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={jumpToToday}
                                        className="px-2.5 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-bold rounded-lg sm:rounded-xl hover:bg-white hover:shadow-sm dark:hover:bg-white/10 text-neutral-700 dark:text-neutral-200 transition-all cursor-pointer"
                                    >
                                        Today
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={nextMonth}
                                        aria-label="Next Month"
                                        className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl hover:bg-white hover:shadow-sm dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-300 transition-all cursor-pointer"
                                    >
                                        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Calendar Grid Container */}
                        <div className="w-full relative z-10">
                            {/* Weekdays Row */}
                            <div className="grid grid-cols-7 mb-2 sm:mb-4">
                                {weekDays.map((day, idx) => (
                                    <div 
                                        key={day} 
                                        className={cn(
                                            "text-center text-[10px] sm:text-xs font-bold uppercase tracking-wider py-1 truncate",
                                            idx === 0 
                                                ? "text-rose-600 dark:text-rose-400 font-extrabold" 
                                                : idx === 6
                                                    ? "text-amber-500 dark:text-amber-400 font-extrabold"
                                                    : "text-neutral-400 dark:text-neutral-500"
                                        )}
                                    >
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Day Cells Grid */}
                            <div className={cn("grid grid-cols-7 gap-1 sm:gap-1.5 md:gap-2", isPending && "opacity-50 transition-opacity duration-200")}>
                                {calendarData.map(cell => (
                                    <DayCell key={cell.dateKey} cell={cell} onSelect={handleSelectDate} />
                                ))}
                            </div>
                        </div>
                    </>
                ) : (
                    /* Public Holidays Comparison View */
                    <div className="w-full relative z-10 space-y-4">
                        {/* Search & Filter Bar */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl bg-neutral-100/60 dark:bg-white/5 border border-neutral-200/60 dark:border-white/10">
                            <div className="relative flex-1">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                                <input
                                    type="text"
                                    value={holidaySearch}
                                    onChange={(e) => setHolidaySearch(e.target.value)}
                                    placeholder="Search holiday by name, Khmer name, or date..."
                                    className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                />
                            </div>

                            <div className="flex items-center gap-2 shrink-0 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                                <ListFilter className="w-3.5 h-3.5" />
                                <span>Showing {filteredHolidays.length} of {holidays.length} holidays ({currentYear})</span>
                            </div>
                        </div>

                        {/* Comparison Grid Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
                            {filteredHolidays.map((h) => {
                                const [y, m, d] = h.date.split('-').map(Number);
                                const hDate = new Date(y, m - 1, d);
                                const khmerName = KHMER_HOLIDAY_NAMES[h.name] || 'បុណ្យជាតិ';
                                
                                let lunarString = '';
                                try {
                                    const fdt = new FormatDateTime(hDate, "ថ្ងៃlW ទីldlN ខែlM ឆ្នាំlA ព.ស. BBBB", locale);
                                    lunarString = fdt.formatDate();
                                } catch {
                                    lunarString = 'គណនាប្រតិទិនចន្ទគតិ';
                                }

                                return (
                                    <div
                                        key={h.date + h.name}
                                        className="p-3.5 sm:p-4 rounded-2xl bg-white/50 dark:bg-white/5 border border-neutral-200/70 dark:border-white/10 hover:border-rose-500/40 hover:bg-rose-500/5 transition-all flex flex-col justify-between gap-3 group/card"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20">
                                                        {h.date}
                                                    </span>
                                                    <span className="text-[10px] uppercase font-bold text-neutral-400">
                                                        {intlFormatters.weekdayShort.format(hDate)}
                                                    </span>
                                                </div>
                                                <h3 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white mt-1.5">
                                                    {h.name}
                                                </h3>
                                                <p className="text-xs font-medium text-rose-600 dark:text-rose-400 mt-0.5 font-[family-name:var(--font-kantumruy)]">
                                                    {khmerName}
                                                </p>
                                            </div>
                                            
                                            <button
                                                type="button"
                                                onClick={() => jumpToDate(h.date)}
                                                className="p-2 rounded-xl bg-neutral-100 dark:bg-white/5 group-hover/card:bg-rose-500 group-hover/card:text-white text-neutral-500 transition-all cursor-pointer shrink-0"
                                                title="Jump to date in calendar"
                                            >
                                                <CalendarIcon className="w-4 h-4" />
                                            </button>
                                        </div>

                                        {/* Lunar Date Alignment Details */}
                                        <div className="pt-2 border-t border-neutral-100 dark:border-white/5 flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400">
                                            <div className="flex items-center gap-1.5 truncate">
                                                <MoonStar className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                                                <span className="font-[family-name:var(--font-kantumruy)] truncate">
                                                    {lunarString}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            <DateDetailPopup
                selectedDate={selectedDate}
                holiday={selectedDateHoliday || undefined}
                locale={locale}
                intlFormatters={intlFormatters}
                onClose={handleCloseDrawer}
            />
        </div>
    );
}

export default LunarCalendarWidget;
