'use client';

import { useState, useMemo, useEffect, useTransition } from 'react';
import { FormatDateTime } from '@pphatdev/format-datetime';
import { ChevronLeft, ChevronRight, MoonStar, Globe, X, Calendar as CalendarIcon, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

export function LunarCalendarWidget() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [mounted, setMounted] = useState(false);
    const [locale, setLocale] = useState('km-KH');
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        setMounted(true);
    }, []);

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
            } catch(e) {
                return { lunarDayNum: "?", lunarPhase: "" };
            }
        };
        
        // Previous month days
        for (let i = startingDayOfWeek - 1; i >= 0; i--) {
            const date = new Date(year, month - 1, previousMonthLastDay - i);
            days.push({ date, isCurrentMonth: false, ...getLunarInfo(date) });
        }
        
        // Current month days
        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(year, month, i);
            days.push({ date, isCurrentMonth: true, ...getLunarInfo(date) });
        }
        
        // Next month days to fill the grid (42 cells total for 6 rows)
        const remainingCells = 42 - days.length;
        for (let i = 1; i <= remainingCells; i++) {
            const date = new Date(year, month + 1, i);
            days.push({ date, isCurrentMonth: false, ...getLunarInfo(date) });
        }
        
        return days;
    }, [currentDate, locale]);

    const nextMonth = () => {
        startTransition(() => {
            setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
        });
    };

    const prevMonth = () => {
        startTransition(() => {
            setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
        });
    };

    const jumpToToday = () => {
        startTransition(() => {
            setCurrentDate(new Date());
        });
    };

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

    if (!mounted) return null;

    return (
        <div className="w-full relative group">
            {/* Ambient Background Glow */}
            <div className="absolute -inset-0.5 bg-linear-to-r from-teal-500/30 via-purple-500/30 to-sky-500/30 rounded-3xl blur-2xl opacity-40 group-hover:opacity-70 transition duration-1000 group-hover:duration-200 pointer-events-none" />
            
            <div className="bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-3xl border border-neutral-200 dark:border-white/10 rounded-2xl sm:rounded-3xl p-3 sm:p-6 md:p-8 relative overflow-hidden flex flex-col w-full shadow-xl">
                
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
                                    } catch(e) {
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
                                onClick={prevMonth}
                                aria-label="Previous Month"
                                className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl hover:bg-white hover:shadow-sm dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-300 transition-all cursor-pointer"
                            >
                                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                            <button 
                                onClick={jumpToToday}
                                className="px-2.5 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-bold rounded-lg sm:rounded-xl hover:bg-white hover:shadow-sm dark:hover:bg-white/10 text-neutral-700 dark:text-neutral-200 transition-all cursor-pointer"
                            >
                                Today
                            </button>
                            <button 
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
                            
                            const { lunarDayNum, lunarPhase } = cell;
                            
                            const isFullMoon = lunarDayNum === "១៥" && lunarPhase.includes("កើត");
                            const isNewMoon = lunarDayNum === "១៥" && lunarPhase.includes("រោច"); 

                            return (
                                <div 
                                    key={index}
                                    onClick={() => setSelectedDate(cell.date)}
                                    className={cn(
                                        "relative flex flex-col items-center justify-center p-1 sm:p-2 md:p-3 min-h-[58px] sm:min-h-[72px] md:min-h-[90px] rounded-xl sm:rounded-2xl border transition-all duration-200 group/cell overflow-hidden cursor-pointer",
                                        isCurrent 
                                            ? "bg-white/40 dark:bg-white/5 border-neutral-200/60 dark:border-white/5 hover:border-teal-500/30 hover:bg-teal-500/5 dark:hover:bg-teal-500/10 hover:shadow-md hover:shadow-teal-500/10" 
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

                                    {/* Solar Day Number */}
                                    <span className={cn(
                                        "text-xs sm:text-base md:text-xl font-bold z-10 leading-tight",
                                        isTodayCell ? "text-teal-700 dark:text-teal-400" : (isCurrent ? "text-neutral-900 dark:text-neutral-100" : "text-neutral-500")
                                    )}>
                                        {cell.date.getDate()}
                                    </span>
                                    
                                    {/* Lunar Information */}
                                    <div className="flex flex-col items-center mt-0.5 sm:mt-1 z-10 max-w-full px-0.5">
                                        <span className={cn(
                                            "text-[9px] sm:text-[11px] md:text-xs font-medium leading-none font-[family-name:var(--font-kantumruy)]",
                                            isCurrent ? "text-teal-600 dark:text-teal-400" : "text-neutral-400/50"
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
                                    
                                    {/* Subtle cell hover effect */}
                                    <div className="absolute inset-0 bg-linear-to-b from-transparent to-teal-500/5 opacity-0 group-hover/cell:opacity-100 rounded-xl sm:rounded-2xl transition-opacity pointer-events-none" />
                                </div>
                            );
                        })}
                    </div>
                </div>
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
                        "relative w-full sm:w-[460px] max-h-[85vh] overflow-y-auto bg-white/95 dark:bg-neutral-900/95 backdrop-blur-2xl border-t sm:border border-neutral-200 dark:border-white/10 sm:rounded-3xl rounded-t-3xl shadow-2xl transition-all duration-300 ease-out transform pointer-events-auto",
                        selectedDate ? "translate-y-0 scale-100" : "translate-y-full sm:translate-y-12 sm:scale-95 opacity-0 pointer-events-none"
                    )}
                >
                    {/* Mobile Drag Indicator Bar */}
                    <div className="sm:hidden w-12 h-1.5 rounded-full bg-neutral-300 dark:bg-white/20 mx-auto mt-3 mb-1" />

                    <div className="flex items-center justify-between p-4 sm:p-6 border-b border-neutral-200/50 dark:border-white/10">
                        <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2 text-neutral-900 dark:text-white">
                            <CalendarIcon className="w-5 h-5 text-teal-500" />
                            Date Details
                        </h3>
                        <button 
                            onClick={() => setSelectedDate(null)}
                            aria-label="Close details"
                            className="p-1.5 sm:p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-neutral-500 transition-colors cursor-pointer"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    
                    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                        {selectedDate && (
                            <>
                                {/* Gregorian Date */}
                                <div className="space-y-1">
                                    <div className="text-xs font-semibold text-neutral-500 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                                        <Globe className="w-3.5 h-3.5" /> Gregorian
                                    </div>
                                    <div className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white">
                                        {new Intl.DateTimeFormat(locale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(selectedDate)}
                                    </div>
                                </div>

                                {/* Khmer Lunar Date */}
                                <div className="space-y-2 sm:space-y-3 p-3.5 sm:p-4 bg-teal-500/5 dark:bg-teal-500/10 border border-teal-500/20 rounded-2xl">
                                    <div className="text-xs font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-widest flex items-center gap-1.5">
                                        <MoonStar className="w-3.5 h-3.5" /> Khmer Lunar
                                    </div>
                                    <div className="text-base sm:text-xl font-medium font-[family-name:var(--font-kantumruy)] text-neutral-800 dark:text-neutral-200 leading-relaxed">
                                        {(() => {
                                            try {
                                                const fdt = new FormatDateTime(selectedDate, "ថ្ងៃlW ទីldlN ខែlM ឆ្នាំlA lE ព.ស. BBBB", locale);
                                                return fdt.formatDate();
                                            } catch (e) {
                                                return "Unable to format lunar date.";
                                            }
                                        })()}
                                    </div>
                                </div>
                                
                                <div className="flex items-start gap-2 p-3 bg-neutral-100/50 dark:bg-white/5 rounded-xl text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                                    <Info className="w-4 h-4 shrink-0 mt-0.5 text-teal-500" />
                                    <p>Lunar calculations powered by <code className="text-[11px] bg-black/5 dark:bg-white/10 px-1 py-0.5 rounded font-mono">@pphatdev/format-datetime</code>.</p>
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
