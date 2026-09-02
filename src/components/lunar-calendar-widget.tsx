'use client';

import { useState, useMemo, useEffect, useTransition, useCallback } from 'react';
import { FormatDateTime } from '@pphatdev/format-datetime';
import { 
    ChevronLeft, 
    ChevronRight, 
    MoonStar, 
    Globe, 
    X, 
    Calendar as CalendarIcon, 
    Info, 
    Sparkles, 
    Search, 
    ArrowUpRight, 
    CalendarDays,
    ListFilter
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { 
    fetchCambodiaHolidays, 
    formatDateKey, 
    PublicHoliday, 
    KHMER_HOLIDAY_NAMES 
} from '@/lib/holidays';

export function LunarCalendarWidget() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [mounted, setMounted] = useState(false);
    const [locale, setLocale] = useState('km-KH');
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [holidays, setHolidays] = useState<PublicHoliday[]>([]);
    const [isLoadingHolidays, setIsLoadingHolidays] = useState(false);
    const [activeTab, setActiveTab] = useState<'calendar' | 'holidays'>('calendar');
    const [holidaySearch, setHolidaySearch] = useState('');
    const [isPending, startTransition] = useTransition();

    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    useEffect(() => {
        setMounted(true);
    }, []);

    // Fetch public holidays for the current year
    useEffect(() => {
        let isMounted = true;
        setIsLoadingHolidays(true);

        fetchCambodiaHolidays(currentYear)
            .then(data => {
                if (isMounted) {
                    setHolidays(data);
                    setIsLoadingHolidays(false);
                }
            })
            .catch(() => {
                if (isMounted) {
                    setIsLoadingHolidays(false);
                }
            });

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

    const calendarData = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay(); // 0 (Sun) to 6 (Sat)
        
        const previousMonthLastDay = new Date(year, month, 0).getDate();
        
        const days = [];

        const getLunarInfo = (date: Date) => {
            try {
                const fdt = new FormatDateTime(date, "ld|lN", locale);
                const [lunarDayNum, lunarPhase] = fdt.formatDate().split('|');
                return { lunarDayNum, lunarPhase };
            } catch {
                return { lunarDayNum: "?", lunarPhase: "" };
            }
        };
        
        // Previous month days
        for (let i = startingDayOfWeek - 1; i >= 0; i--) {
            const date = new Date(year, month - 1, previousMonthLastDay - i);
            const dateKey = formatDateKey(date);
            days.push({ 
                date, 
                dateKey,
                isCurrentMonth: false, 
                holiday: holidaysMap.get(dateKey),
                ...getLunarInfo(date) 
            });
        }
        
        // Current month days
        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(year, month, i);
            const dateKey = formatDateKey(date);
            days.push({ 
                date, 
                dateKey,
                isCurrentMonth: true, 
                holiday: holidaysMap.get(dateKey),
                ...getLunarInfo(date) 
            });
        }
        
        // Next month days to fill the grid (42 cells total for 6 rows)
        const remainingCells = 42 - days.length;
        for (let i = 1; i <= remainingCells; i++) {
            const date = new Date(year, month + 1, i);
            const dateKey = formatDateKey(date);
            days.push({ 
                date, 
                dateKey,
                isCurrentMonth: false, 
                holiday: holidaysMap.get(dateKey),
                ...getLunarInfo(date) 
            });
        }
        
        return days;
    }, [currentDate, locale, holidaysMap]);

    const nextMonth = useCallback(() => {
        startTransition(() => {
            setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
        });
    }, []);

    const prevMonth = useCallback(() => {
        startTransition(() => {
            setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
        });
    }, []);

    const jumpToToday = useCallback(() => {
        startTransition(() => {
            setCurrentDate(new Date());
        });
    }, []);

    const jumpToDate = useCallback((dateStr: string) => {
        const [y, m, d] = dateStr.split('-').map(Number);
        const targetDate = new Date(y, m - 1, d);
        startTransition(() => {
            setCurrentDate(targetDate);
            setSelectedDate(targetDate);
            setActiveTab('calendar');
        });
    }, []);

    const monthNames = useMemo(() => {
        return Array.from({ length: 12 }).map((_, i) => {
            return new Intl.DateTimeFormat(locale, { month: 'long' }).format(new Date(2000, i, 1));
        });
    }, [locale]);

    const weekDays = useMemo(() => {
        return Array.from({ length: 7 }).map((_, i) => {
            return new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(new Date(2000, 0, 2 + i)); // 2000-01-02 is Sunday
        });
    }, [locale]);

    const today = new Date();
    const isToday = (date: Date) => {
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    };

    // Filtered holidays for comparison table
    const filteredHolidays = useMemo(() => {
        return holidays.filter(h => {
            const khmerName = KHMER_HOLIDAY_NAMES[h.name] || '';
            const query = holidaySearch.toLowerCase().trim();
            if (!query) return true;
            return (
                h.name.toLowerCase().includes(query) ||
                khmerName.toLowerCase().includes(query) ||
                h.date.includes(query)
            );
        });
    }, [holidays, holidaySearch]);

    // Selected date holiday info
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
                            onClick={() => setActiveTab('calendar')}
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
                            onClick={() => setActiveTab('holidays')}
                            className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer",
                                activeTab === 'holidays'
                                    ? "bg-white dark:bg-neutral-800 text-teal-600 dark:text-teal-400 shadow-xs"
                                    : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                            )}
                        >
                            <Sparkles className="w-4 h-4 text-amber-500" />
                            Public Holidays ({holidays.length})
                        </button>
                    </div>

                    {/* Quick Badge info */}
                    <div className="flex items-center gap-2">
                        {currentMonthHolidays.length > 0 ? (
                            <button
                                type="button"
                                onClick={() => setActiveTab('holidays')}
                                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors cursor-pointer"
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                {currentMonthHolidays.length} Public Holiday{currentMonthHolidays.length > 1 ? 's' : ''} this month
                            </button>
                        ) : (
                            <span className="text-xs text-neutral-400 font-medium hidden sm:inline-block">
                                No public holidays in {monthNames[currentMonth]}
                            </span>
                        )}
                        <a
                            href="https://nagerholidays.com/api/v4/Holidays/KH/2026"
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
                                        {(() => {
                                            try {
                                                const fdt = new FormatDateTime(currentDate, "ឆ្នាំlA ព.ស. BBBB", locale);
                                                return fdt.formatDate();
                                            } catch {
                                                return "Lunar Calendar";
                                            }
                                        })()}
                                    </p>
                                </div>
                            </div>
                            
                            {/* Controls Row (Language + Prev/Today/Next) */}
                            <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto justify-between sm:justify-end">
                                <div className="w-1/2 sm:w-[150px]">
                                    <Select value={locale} onValueChange={(v) => startTransition(() => setLocale(v || 'km-KH'))}>
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
                                {weekDays.map(day => (
                                    <div key={day} className="text-center text-[10px] sm:text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider py-1 truncate">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Day Cells Grid */}
                            <div className={cn("grid grid-cols-7 gap-1 sm:gap-1.5 md:gap-2", isPending && "opacity-50 transition-opacity duration-200")}>
                                {calendarData.map((cell, index) => {
                                    const isCurrent = cell.isCurrentMonth;
                                    const isTodayCell = isToday(cell.date);
                                    const hasHoliday = !!cell.holiday;
                                    
                                    const { lunarDayNum, lunarPhase } = cell;
                                    
                                    const isFullMoon = lunarDayNum === "១៥" && lunarPhase.includes("កើត");
                                    const isNewMoon = lunarDayNum === "១៥" && lunarPhase.includes("រោច"); 

                                    return (
                                        <div 
                                            key={index}
                                            onClick={() => setSelectedDate(cell.date)}
                                            className={cn(
                                                "relative flex flex-col items-center justify-center p-1 sm:p-2 md:p-3 min-h-[62px] sm:min-h-[76px] md:min-h-[94px] rounded-xl sm:rounded-2xl border transition-all duration-200 group/cell overflow-hidden cursor-pointer",
                                                isCurrent 
                                                    ? hasHoliday
                                                        ? "bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/30 dark:border-amber-500/30 hover:border-amber-500/60 hover:bg-amber-500/15 hover:shadow-md hover:shadow-amber-500/10"
                                                        : "bg-white/40 dark:bg-white/5 border-neutral-200/60 dark:border-white/5 hover:border-teal-500/30 hover:bg-teal-500/5 dark:hover:bg-teal-500/10 hover:shadow-md hover:shadow-teal-500/10" 
                                                    : "bg-transparent border-transparent opacity-25",
                                                isTodayCell && "ring-2 ring-teal-500/60 border-teal-500/60 bg-teal-500/10 dark:bg-teal-500/20 shadow-sm shadow-teal-500/20"
                                            )}
                                        >
                                            {/* Moon Phase Accent Dots */}
                                            {isCurrent && isFullMoon && (
                                                <div className="absolute top-1 right-1 sm:top-2 sm:right-2 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,1)]" title="Full Moon" />
                                            )}
                                            {isCurrent && isNewMoon && (
                                                <div className="absolute top-1 right-1 sm:top-2 sm:right-2 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-slate-800 dark:bg-slate-300 shadow-[0_0_8px_rgba(100,116,139,0.5)]" title="New Moon" />
                                            )}

                                            {/* Public Holiday Star Accent */}
                                            {isCurrent && hasHoliday && (
                                                <div className="absolute top-1 left-1 sm:top-2 sm:left-2 flex items-center gap-0.5 text-amber-600 dark:text-amber-400" title={cell.holiday?.name}>
                                                    <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-amber-500/20" />
                                                </div>
                                            )}

                                            {/* Solar Day Number */}
                                            <span className={cn(
                                                "text-xs sm:text-base md:text-xl font-bold z-10 leading-tight",
                                                hasHoliday ? "text-amber-700 dark:text-amber-300 font-extrabold" : (
                                                    isTodayCell ? "text-teal-700 dark:text-teal-400" : (isCurrent ? "text-neutral-900 dark:text-neutral-100" : "text-neutral-500")
                                                )
                                            )}>
                                                {cell.date.getDate()}
                                            </span>
                                            
                                            {/* Lunar Information */}
                                            <div className="flex flex-col items-center mt-0.5 sm:mt-1 z-10 max-w-full px-0.5">
                                                <span className={cn(
                                                    "text-[9px] sm:text-[11px] md:text-xs font-medium leading-none font-[family-name:var(--font-kantumruy)]",
                                                    hasHoliday ? "text-amber-600 dark:text-amber-400 font-bold" : (
                                                        isCurrent ? "text-teal-600 dark:text-teal-400" : "text-neutral-400/50"
                                                    )
                                                )}>
                                                    {lunarDayNum}
                                                </span>
                                                <span className={cn(
                                                    "text-[7px] sm:text-[9px] md:text-[10px] mt-0.5 font-[family-name:var(--font-kantumruy)] truncate max-w-full text-center leading-none",
                                                    isCurrent ? "text-neutral-500 dark:text-neutral-400" : "text-neutral-400/40"
                                                )}>
                                                    {lunarPhase}
                                                </span>
                                            </div>

                                            {/* Holiday micro badge for large screens */}
                                            {isCurrent && hasHoliday && (
                                                <span className="hidden md:inline-block max-w-[90%] truncate text-[8px] font-semibold text-amber-700 dark:text-amber-400 mt-1 leading-none px-1 py-0.5 rounded-sm bg-amber-500/10">
                                                    {cell.holiday?.name}
                                                </span>
                                            )}
                                            
                                            {/* Subtle cell hover effect */}
                                            <div className="absolute inset-0 bg-linear-to-b from-transparent to-teal-500/5 opacity-0 group-hover/cell:opacity-100 rounded-xl sm:rounded-2xl transition-opacity pointer-events-none" />
                                        </div>
                                    );
                                })}
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
                                        className="p-3.5 sm:p-4 rounded-2xl bg-white/50 dark:bg-white/5 border border-neutral-200/70 dark:border-white/10 hover:border-amber-500/40 hover:bg-amber-500/5 transition-all flex flex-col justify-between gap-3 group/card"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                                                        {h.date}
                                                    </span>
                                                    <span className="text-[10px] uppercase font-bold text-neutral-400">
                                                        {new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(hDate)}
                                                    </span>
                                                </div>
                                                <h3 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white mt-1.5">
                                                    {h.name}
                                                </h3>
                                                <p className="text-xs font-medium text-teal-600 dark:text-teal-400 mt-0.5 font-[family-name:var(--font-kantumruy)]">
                                                    {khmerName}
                                                </p>
                                            </div>
                                            
                                            <button
                                                type="button"
                                                onClick={() => jumpToDate(h.date)}
                                                className="p-2 rounded-xl bg-neutral-100 dark:bg-white/5 group-hover/card:bg-teal-500 group-hover/card:text-white text-neutral-500 transition-all cursor-pointer shrink-0"
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

            {/* Responsive Date Details Drawer / Bottom Sheet */}
            <div 
                className={cn(
                    "fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-0 sm:p-4 transition-all duration-300",
                    selectedDate ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                )}
            >
                {/* Backdrop */}
                <div 
                    className={cn(
                        "absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300",
                        selectedDate ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
                    )}
                    onClick={() => setSelectedDate(null)}
                />

                {/* Drawer Content */}
                <div 
                    className={cn(
                        "relative w-full sm:w-[480px] max-h-[85vh] overflow-y-auto bg-white/95 dark:bg-neutral-900/95 backdrop-blur-2xl border-t sm:border border-neutral-200 dark:border-white/10 sm:rounded-3xl rounded-t-3xl shadow-2xl transition-all duration-300 ease-out transform pointer-events-auto",
                        selectedDate ? "translate-y-0 scale-100" : "translate-y-full sm:translate-y-12 sm:scale-95 opacity-0 pointer-events-none"
                    )}
                >
                    {/* Mobile Drag Indicator Bar */}
                    <div className="sm:hidden w-12 h-1.5 rounded-full bg-neutral-300 dark:bg-white/20 mx-auto mt-3 mb-1" />

                    <div className="flex items-center justify-between p-4 sm:p-6 border-b border-neutral-200/50 dark:border-white/10">
                        <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2 text-neutral-900 dark:text-white">
                            <CalendarIcon className="w-5 h-5 text-teal-500" />
                            Date & Holiday Details
                        </h3>
                        <button 
                            type="button"
                            onClick={() => setSelectedDate(null)}
                            aria-label="Close details"
                            className="p-1.5 sm:p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-neutral-500 transition-colors cursor-pointer"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    
                    <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
                        {selectedDate && (
                            <>
                                {/* Public Holiday Banner (If matched from API) */}
                                {selectedDateHoliday && (
                                    <div className="p-4 rounded-2xl bg-linear-to-r from-amber-500/15 via-rose-500/10 to-amber-500/10 border border-amber-500/30 dark:border-amber-500/20 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1">
                                                <Sparkles className="w-3 h-3" />
                                                Official Public Holiday
                                            </span>
                                            <span className="text-[10px] font-mono text-neutral-500">
                                                {selectedDateHoliday.countryCode}
                                            </span>
                                        </div>
                                        <div>
                                            <h4 className="text-base sm:text-lg font-extrabold text-neutral-900 dark:text-white">
                                                {selectedDateHoliday.name}
                                            </h4>
                                            {KHMER_HOLIDAY_NAMES[selectedDateHoliday.name] && (
                                                <p className="text-sm font-semibold text-amber-700 dark:text-amber-400 font-[family-name:var(--font-kantumruy)] mt-0.5">
                                                    {KHMER_HOLIDAY_NAMES[selectedDateHoliday.name]}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Gregorian Date */}
                                <div className="space-y-1">
                                    <div className="text-xs font-semibold text-neutral-500 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                                        <Globe className="w-3.5 h-3.5" /> Gregorian Calendar
                                    </div>
                                    <div className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white">
                                        {new Intl.DateTimeFormat(locale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(selectedDate)}
                                    </div>
                                </div>

                                {/* Khmer Lunar Date */}
                                <div className="space-y-2 sm:space-y-3 p-3.5 sm:p-4 bg-teal-500/5 dark:bg-teal-500/10 border border-teal-500/20 rounded-2xl">
                                    <div className="text-xs font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-widest flex items-center gap-1.5">
                                        <MoonStar className="w-3.5 h-3.5" /> Khmer Lunar Alignment
                                    </div>
                                    <div className="text-base sm:text-xl font-medium font-[family-name:var(--font-kantumruy)] text-neutral-800 dark:text-neutral-200 leading-relaxed">
                                        {(() => {
                                            try {
                                                const fdt = new FormatDateTime(selectedDate, "ថ្ងៃlW ldlN ខែlM ឆ្នាំlA lE ព.ស. BBBB ត្រូវនឹងថ្ងៃទី dd ខែ MMMM ឆ្នាំ YYYY", locale);
                                                return fdt.formatDate();
                                            } catch {
                                                return "Unable to format lunar date.";
                                            }
                                        })()}
                                    </div>
                                </div>
                                
                                <div className="flex items-start gap-2 p-3 bg-neutral-100/50 dark:bg-white/5 rounded-xl text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                                    <Info className="w-4 h-4 shrink-0 mt-0.5 text-teal-500" />
                                    <p>
                                        Calculated using <code className="text-[11px] bg-black/5 dark:bg-white/10 px-1 py-0.5 rounded font-mono">@pphatdev/format-datetime</code> and verified against <a href="https://nagerholidays.com/api/v4/Holidays/KH/2026" target="_blank" rel="noreferrer" className="text-teal-600 dark:text-teal-400 underline font-medium">Nager.Date API</a>.
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LunarCalendarWidget;
