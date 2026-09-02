'use client';

import { useState, useMemo, useEffect, useTransition, useCallback, memo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { FormatDateTime } from '@pphatdev/format-datetime';
import {
    ChevronLeft,
    ChevronRight,
    MoonStar,
    Globe,
    Calendar as CalendarIcon,
    Sparkles,
    Search,
    ListFilter,
    CalendarDays,
    ArrowUpRight,
    X
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
                "relative flex flex-col items-center justify-between p-1 sm:p-1.5 md:p-2 min-h-16 sm:min-h-20 md:min-h-24 rounded-xl sm:rounded-2xl border transition-all duration-200 group/cell overflow-hidden cursor-pointer",
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
                    "text-[9px] sm:text-[11px] md:text-xs font-medium leading-none font-kantumruy",
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
                    "text-[7px] sm:text-[9px] md:text-[10px] mt-0.5 font-kantumruy truncate max-w-full text-center leading-none",
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
    const [holidayMonth, setHolidayMonth] = useState<string>('all');
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

    const availableYears = useMemo(() => {
        const base = new Date().getFullYear();
        const years: number[] = [];
        for (let y = base - 5; y <= base + 6; y++) {
            years.push(y);
        }
        return years;
    }, []);

    const handleHolidayYearChange = (yearStr: string | null) => {
        if (!yearStr) return;
        const y = parseInt(yearStr, 10);
        if (!isNaN(y)) {
            startTransition(() => {
                const newDate = new Date(y, currentDate.getMonth(), 1);
                setCurrentDate(newDate);
                updateUrlParams(newDate, activeTab, selectedDate, locale);
            });
        }
    };

    const handleHolidayMonthChange = (monthStr: string | null) => {
        setHolidayMonth(monthStr || 'all');
    };



    const currentMonthLunarLabel = useMemo(() => {
        try {
            return new FormatDateTime(currentDate, "ឆ្នាំlA ព.ស. BBBB", locale).formatDate();
        } catch {
            return "Lunar Calendar";
        }
    }, [currentDate, locale]);

    const filteredHolidays = useMemo(() => {
        const query = holidaySearch.toLowerCase().trim();
        return holidays.filter(h => {
            const [y, m] = h.date.split('-').map(Number);
            if (holidayMonth !== 'all' && m !== Number(holidayMonth)) {
                return false;
            }
            if (query) {
                const khmerName = KHMER_HOLIDAY_NAMES[h.name] || '';
                return (
                    h.name.toLowerCase().includes(query) ||
                    khmerName.toLowerCase().includes(query) ||
                    h.date.includes(query)
                );
            }
            return true;
        });
    }, [holidays, holidaySearch, holidayMonth]);

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
                        <div className="flex flex-col gap-3 p-3 sm:p-4 rounded-2xl bg-neutral-100/60 dark:bg-white/5 border border-neutral-200/60 dark:border-white/10">
                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
                                {/* Search input */}
                                <div className="relative sm:col-span-6 md:col-span-6">
                                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                                    <input
                                        type="text"
                                        value={holidaySearch}
                                        onChange={(e) => setHolidaySearch(e.target.value)}
                                        placeholder="Search holiday by name, Khmer name, or date..."
                                        className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    />
                                    {holidaySearch && (
                                        <button
                                            type="button"
                                            onClick={() => setHolidaySearch('')}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
                                            aria-label="Clear search"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>

                                {/* Year Selector */}
                                <div className="sm:col-span-3 md:col-span-3">
                                    <Select value={String(currentYear)} onValueChange={handleHolidayYearChange}>
                                        <SelectTrigger className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 text-neutral-900 dark:text-white rounded-xl focus:ring-teal-500 font-medium text-xs sm:text-sm h-9 sm:h-10">
                                            <div className="flex items-center gap-1.5 truncate">
                                                <CalendarIcon className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                                                <SelectValue placeholder="Year" />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent className="z-150 max-h-60">
                                            {availableYears.map((yr) => (
                                                <SelectItem key={yr} value={String(yr)}>
                                                    {yr}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Month Selector */}
                                <div className="sm:col-span-3 md:col-span-3">
                                    <Select value={holidayMonth} onValueChange={handleHolidayMonthChange}>
                                        <SelectTrigger className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 text-neutral-900 dark:text-white rounded-xl focus:ring-teal-500 font-medium text-xs sm:text-sm h-9 sm:h-10">
                                            <div className="flex items-center gap-1.5 truncate">
                                                <CalendarDays className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                                                <SelectValue placeholder="Month" />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent className="z-150 max-h-60">
                                            <SelectItem value="all">All Months</SelectItem>
                                            {monthNames.map((name, idx) => (
                                                <SelectItem key={idx + 1} value={String(idx + 1)}>
                                                    {name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Filter status row & quick actions */}
                            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-200/50 dark:border-white/5 text-xs">
                                <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                                    <ListFilter className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                                    <span className="font-medium">
                                        Showing <strong className="text-neutral-900 dark:text-white">{filteredHolidays.length}</strong> of {holidays.length} holidays
                                        {holidayMonth !== 'all' && (
                                            <> in <span className="text-teal-600 dark:text-teal-400 font-semibold">{monthNames[Number(holidayMonth) - 1]}</span></>
                                        )}
                                        {' '}({currentYear})
                                    </span>
                                </div>

                                {(holidayMonth !== 'all' || holidaySearch) && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setHolidayMonth('all');
                                            setHolidaySearch('');
                                        }}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 transition-colors cursor-pointer"
                                    >
                                        <X className="w-3 h-3" />
                                        Reset Filters
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Comparison Grid Cards or Empty State */}
                        {filteredHolidays.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-2xl bg-neutral-50/50 dark:bg-white/[0.02] border border-dashed border-neutral-200 dark:border-white/10">
                                <div className="p-3 rounded-2xl bg-neutral-100 dark:bg-white/5 text-neutral-400 mb-3">
                                    <CalendarDays className="w-6 h-6" />
                                </div>
                                <p className="text-sm font-bold text-neutral-900 dark:text-white">
                                    No public holidays found
                                </p>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm">
                                    {holidayMonth !== 'all' || holidaySearch
                                        ? "No holidays match your current filter criteria. Try selecting another month or clearing search."
                                        : `There are no recorded public holidays for ${currentYear}.`}
                                </p>
                                {(holidayMonth !== 'all' || holidaySearch) && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setHolidayMonth('all');
                                            setHolidaySearch('');
                                        }}
                                        className="mt-4 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-teal-500/10 text-teal-600 dark:text-teal-400 hover:bg-teal-500/20 transition-colors cursor-pointer"
                                    >
                                        Clear all filters
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-1">
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
                                                    <p className="text-xs font-medium text-rose-600 dark:text-rose-400 mt-0.5 font-kantumruy">
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
                                                    <span className="font-kantumruy truncate">
                                                        {lunarString}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
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
