'use client';

import { useState, useMemo, useEffect, useTransition, useCallback, memo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { FormatDateTime } from '@pphatdev/format-datetime';
import {
    ChevronLeft,
    ChevronRight,
    MoonStar,
    Globe,
    Sparkles,
    ArrowUpRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import {
    fetchCambodiaHolidays,
    formatDateKey,
    PublicHoliday,
    SHORT_KHMER_HOLIDAY_NAMES
} from '@/lib/holidays';
import { DateDetailPopup } from '@/components/date-detail-popup';

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
    holiday?: PublicHoliday;
    lunarDayNum: string;
    lunarPhase: string;
    isFullMoon: boolean;
    isNewMoon: boolean;
}

const DayCell = memo(function DayCell({
    cell,
    onSelect,
}: {
    cell: CalendarCell;
    onSelect: (date: Date) => void;
}) {
    const {
        date,
        isCurrentMonth,
        isTodayCell,
        isSunday,
        isSaturday,
        isHolyDay,
        holiday,
        lunarDayNum,
        lunarPhase,
        isFullMoon,
        isNewMoon,
    } = cell;

    const hasHoliday = Boolean(holiday);
    const khmerHolidayName = holiday ? (SHORT_KHMER_HOLIDAY_NAMES[holiday.name] || holiday.name) : '';
    const fullKhmerHolidayName = holiday ? (SHORT_KHMER_HOLIDAY_NAMES[holiday.name] || holiday.name) : '';

    return (
        <div
            onClick={() => onSelect(date)}
            className={cn(
                "min-h-16 sm:min-h-20 md:min-h-24 p-1 sm:p-2 rounded-xl sm:rounded-2xl transition-all duration-200 border flex flex-col justify-between relative group/cell cursor-pointer select-none",
                // Current vs other month
                isCurrentMonth
                    ? "bg-white/70 dark:bg-white/4 border-neutral-200/80 dark:border-white/10 hover:border-teal-500/50 hover:bg-teal-50/30 dark:hover:bg-teal-950/20 hover:shadow-md hover:-translate-y-0.5"
                    : "bg-neutral-50/40 dark:bg-white/1 border-transparent opacity-35 hover:opacity-75 hover:bg-neutral-100/50 dark:hover:bg-white/5",
                // Today styling
                isTodayCell && "ring-2 ring-teal-500 ring-offset-2 ring-offset-white dark:ring-offset-neutral-950 bg-teal-50/40 dark:bg-teal-950/30 border-teal-500/40",
                // Holy day subtle background
                isCurrentMonth && isHolyDay && !isTodayCell && "bg-amber-50/30 dark:bg-amber-950/15 border-amber-500/20",
                // Holiday subtle glow
                isCurrentMonth && hasHoliday && !isTodayCell && "border-rose-500/30 bg-rose-50/20 dark:bg-rose-950/15"
            )}
        >
            {/* Top Row: Solar Day Number + Badges */}
            <div className="flex items-center justify-between gap-0.5">
                <span
                    className={cn(
                        "text-[11px] sm:text-xs md:text-sm font-bold w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center transition-colors",
                        isTodayCell
                            ? "bg-teal-500 text-white font-extrabold shadow-sm"
                            : isSunday
                                ? "text-rose-600 dark:text-rose-400 font-extrabold"
                                : isSaturday
                                    ? "text-amber-500 dark:text-amber-400 font-extrabold"
                                    : "text-neutral-700 dark:text-neutral-300"
                    )}
                >
                    {date.getDate()}
                </span>

                {/* Holy Day Indicator Icon */}
                {isHolyDay && isCurrentMonth && (
                    <div
                        className="flex items-center"
                        title={
                            isFullMoon
                                ? "ពេញបូណ៌មី (Full Moon - ថ្ងៃសីល)"
                                : isNewMoon
                                    ? "ដាច់ខែ (New Moon - ថ្ងៃសីល)"
                                    : "ថ្ងៃសីល (Buddhist Holy Day)"
                        }
                    >
                        {isFullMoon ? (
                            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-400 border border-amber-500 shadow-xs shadow-amber-400/50" />
                        ) : isNewMoon ? (
                            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-neutral-900 dark:bg-neutral-100 border border-neutral-600 dark:border-neutral-400 shadow-xs" />
                        ) : (
                            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-amber-500/80 border border-amber-500" />
                        )}
                    </div>
                )}
            </div>

            {/* Middle: Lunar Date (Day number + Waxing/Waning phase) */}
            <div className="flex flex-col items-center justify-center text-center my-auto py-0.5">
                <span
                    className={cn(
                        "text-[9px] sm:text-[11px] md:text-xs font-bold font-kantumruy leading-tight truncate max-w-full tracking-tight",
                        isHolyDay && isCurrentMonth
                            ? "text-amber-600 dark:text-amber-400 font-extrabold"
                            : "text-neutral-800 dark:text-neutral-200"
                    )}
                >
                    {lunarDayNum}
                </span>
                <span
                    className={cn(
                        "text-[7.5px] sm:text-[9px] md:text-[10px] font-medium font-kantumruy leading-tight truncate max-w-full",
                        isHolyDay && isCurrentMonth
                            ? "text-amber-600/90 dark:text-amber-400/90 font-bold"
                            : "text-neutral-500 dark:text-neutral-400"
                    )}
                >
                    {lunarPhase}
                </span>
            </div>

            {/* Bottom: Holiday Badge (if applicable) */}
            {isCurrentMonth && hasHoliday ? (
                <div 
                    className="w-full mt-0.5 px-1 py-0.5 rounded-md bg-rose-500/15 dark:bg-rose-500/25 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-[7px] sm:text-[8px] md:text-[9.5px] font-bold font-kantumruy truncate text-center leading-tight shadow-2xs z-10"
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

// ─── Loading Skeleton ───────────────────────────────────────────────────────

function CalendarGridSkeleton() {
    return (
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5 md:gap-2 animate-pulse">
            {Array.from({ length: 35 }).map((_, i) => (
                <div
                    key={i}
                    className="min-h-16 sm:min-h-20 md:min-h-24 p-1 sm:p-2 rounded-xl sm:rounded-2xl border border-neutral-200/50 dark:border-white/5 bg-neutral-100/60 dark:bg-white/5 flex flex-col justify-between"
                >
                    <div className="flex items-center justify-between">
                        <div className="w-5 h-5 rounded-full bg-neutral-200/80 dark:bg-white/10" />
                        <div className="w-3.5 h-3.5 rounded-full bg-neutral-200/50 dark:bg-white/5" />
                    </div>
                    <div className="flex flex-col items-center gap-1.5 my-auto">
                        <div className="w-10 sm:w-14 h-3 rounded-md bg-neutral-200/80 dark:bg-white/10" />
                        <div className="w-6 sm:w-8 h-2 rounded bg-neutral-200/50 dark:bg-white/5" />
                    </div>
                    <div className="h-1.5 sm:h-2" />
                </div>
            ))}
        </div>
    );
}

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
    const [isPending, startTransition] = useTransition();

    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    useEffect(() => {
        setMounted(true);
    }, []);

    // Fast non-blocking URL search params helper
    const updateUrlParams = useCallback((targetDate: Date, selDate?: Date | null, loc?: string) => {
        const currentSearch = typeof window !== 'undefined' ? window.location.search : searchParams.toString();
        const params = new URLSearchParams(currentSearch);
        params.set('year', String(targetDate.getFullYear()));
        params.set('month', String(targetDate.getMonth() + 1)); // 1-indexed

        if (selDate) {
            params.set('date', formatDateKey(selDate));
        } else {
            params.delete('date');
        }

        if (loc && loc !== 'km-KH') {
            params.set('locale', loc);
        } else {
            params.delete('locale');
        }

        const queryString = params.toString();
        const targetUrl = `${pathname}${queryString ? `?${queryString}` : ''}`;
        try {
            window.history.replaceState(null, '', targetUrl);
        } catch {
            router.replace(targetUrl, { scroll: false });
        }
    }, [pathname, router, searchParams]);

    // Handle browser back/forward or external URL changes
    useEffect(() => {
        const dateParam = searchParams.get('date');
        const yearParam = searchParams.get('year');
        const monthParam = searchParams.get('month');
        const localeParam = searchParams.get('locale');

        if (localeParam && localeParam !== locale) {
            setLocale(localeParam);
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
        updateUrlParams(currentDate, date, locale);
    }, [currentDate, locale, updateUrlParams]);

    const nextMonth = useCallback(() => {
        startTransition(() => {
            const next = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
            setCurrentDate(next);
            updateUrlParams(next, selectedDate, locale);
        });
    }, [currentDate, selectedDate, locale, updateUrlParams]);

    const prevMonth = useCallback(() => {
        startTransition(() => {
            const prev = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
            setCurrentDate(prev);
            updateUrlParams(prev, selectedDate, locale);
        });
    }, [currentDate, selectedDate, locale, updateUrlParams]);

    const jumpToToday = useCallback(() => {
        startTransition(() => {
            const now = new Date();
            setCurrentDate(now);
            setSelectedDate(now);
            updateUrlParams(now, now, locale);
        });
    }, [locale, updateUrlParams]);

    const handleLocaleChange = (newLocale: string | null) => {
        const value = newLocale || 'km-KH';
        startTransition(() => {
            setLocale(value);
            updateUrlParams(currentDate, selectedDate, value);
        });
    };

    const handleCloseDrawer = () => {
        setSelectedDate(null);
        updateUrlParams(currentDate, null, locale);
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

    const selectedDateKey = selectedDate ? formatDateKey(selectedDate) : null;
    const selectedDateHoliday = selectedDateKey ? holidaysMap.get(selectedDateKey) : null;

    if (!mounted) return null;

    return (
        <div className="w-full relative group">
            {/* Ambient Background Glow */}
            <div className="absolute -inset-0.5 bg-linear-to-r from-teal-500/30 via-purple-500/30 to-sky-500/30 rounded-3xl blur-2xl opacity-40 group-hover:opacity-70 transition duration-1000 group-hover:duration-200 pointer-events-none" />
            
            <div className="bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-3xl border border-neutral-200 dark:border-white/10 rounded-2xl sm:rounded-3xl p-3 sm:p-6 md:p-8 relative overflow-hidden flex flex-col w-full shadow-xl">
                
                {/* Top Info Bar (Quick Public Holiday Link & API) */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 pb-4 mb-4 border-b border-neutral-200/60 dark:border-white/10 relative z-10">
                    <div className="flex items-center gap-2">
                        {currentMonthHolidays.length > 0 ? (
                            <Link
                                href={`/holidays?year=${currentYear}&month=${currentMonth + 1}`}
                                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-colors"
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                                {currentMonthHolidays.length} Public Holiday{currentMonthHolidays.length > 1 ? 's' : ''} in {monthNames[currentMonth]}
                                <Sparkles className="w-3 h-3 text-rose-500 ml-0.5" />
                            </Link>
                        ) : (
                            <span className="text-xs text-neutral-400 font-medium">
                                No public holidays in {monthNames[currentMonth]}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href="/holidays"
                            className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
                        >
                            View All Holidays
                            <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                        <span className="text-neutral-300 dark:text-white/10">•</span>
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
                            <p className="text-xs sm:text-sm font-medium text-teal-600 dark:text-teal-400 mt-0.5 font-kantumruy truncate">
                                {currentMonthLunarLabel}
                            </p>
                        </div>
                    </div>
                    
                    {/* Controls Row (Language + Prev/Today/Next) */}
                    <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto justify-between sm:justify-end">
                        <div className="w-1/2 sm:w-37.5">
                            <Select value={locale} onValueChange={handleLocaleChange}>
                                <SelectTrigger className="w-full bg-neutral-100/80 dark:bg-white/5 border border-neutral-200/50 dark:border-white/10 text-neutral-900 dark:text-white rounded-xl backdrop-blur-md focus:ring-teal-500 focus:border-teal-500 font-medium text-xs sm:text-sm h-9 sm:h-10">
                                    <div className="flex items-center gap-1.5 truncate">
                                        <Globe className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                                        <SelectValue placeholder="Language" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="z-150">
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

                    {/* Day Cells Grid or Loading Skeleton */}
                    {isPending ? (
                        <CalendarGridSkeleton />
                    ) : (
                        <div className="grid grid-cols-7 gap-1 sm:gap-1.5 md:gap-2 animate-in fade-in duration-150">
                            {calendarData.map(cell => (
                                <DayCell key={cell.dateKey} cell={cell} onSelect={handleSelectDate} />
                            ))}
                        </div>
                    )}
                </div>
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
