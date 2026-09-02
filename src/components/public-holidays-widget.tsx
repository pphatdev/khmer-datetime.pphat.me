'use client';

import { useState, useMemo, useEffect, useTransition, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { FormatDateTime } from '@pphatdev/format-datetime';
import {
    Search,
    ListFilter,
    CalendarDays,
    ArrowUpRight,
    X,
    Calendar as CalendarIcon,
    MoonStar,
    Globe,
    Sparkles
} from 'lucide-react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import {
    fetchCambodiaHolidays,
    PublicHoliday,
    KHMER_HOLIDAY_NAMES
} from '@/lib/holidays';

function PublicHolidaysSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-1 animate-pulse">
            {Array.from({ length: 6 }).map((_, i) => (
                <div
                    key={i}
                    className="p-3.5 sm:p-4 rounded-2xl bg-neutral-100/60 dark:bg-white/5 border border-neutral-200/50 dark:border-white/5 flex flex-col justify-between gap-3 min-h-32"
                >
                    <div className="flex items-start justify-between gap-2">
                        <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                                <div className="w-20 h-5 rounded-full bg-neutral-200/80 dark:bg-white/10" />
                                <div className="w-10 h-3 rounded bg-neutral-200/50 dark:bg-white/5" />
                            </div>
                            <div className="w-3/4 h-5 rounded-md bg-neutral-200/80 dark:bg-white/10" />
                            <div className="w-1/2 h-3.5 rounded-md bg-neutral-200/50 dark:bg-white/5" />
                        </div>
                        <div className="w-8 h-8 rounded-xl bg-neutral-200/80 dark:bg-white/10 shrink-0" />
                    </div>
                    <div className="pt-2 border-t border-neutral-200/40 dark:border-white/5 flex items-center justify-between">
                        <div className="w-28 h-3.5 rounded bg-neutral-200/50 dark:bg-white/5" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export function PublicHolidaysWidget() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [selectedYear, setSelectedYear] = useState<number>(() => {
        const yearParam = searchParams.get('year');
        if (yearParam) {
            const y = parseInt(yearParam, 10);
            if (!isNaN(y)) return y;
        }
        return new Date().getFullYear();
    });

    const [selectedMonth, setSelectedMonth] = useState<string>(() => {
        return searchParams.get('month') || 'all';
    });

    const [searchQuery, setSearchQuery] = useState('');
    const [locale, setLocale] = useState(() => searchParams.get('locale') || 'km-KH');
    const [holidays, setHolidays] = useState<PublicHoliday[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isPending, startTransition] = useTransition();

    // Fast non-blocking URL search params helper
    const updateUrlParams = useCallback((year: number, month: string, loc: string) => {
        const currentSearch = typeof window !== 'undefined' ? window.location.search : searchParams.toString();
        const params = new URLSearchParams(currentSearch);
        params.set('year', String(year));

        if (month !== 'all') {
            params.set('month', month);
        } else {
            params.delete('month');
        }

        if (loc && loc !== 'km-KH') {
            params.set('locale', loc);
        } else {
            params.delete('locale');
        }

        const qs = params.toString();
        const targetUrl = `${pathname}${qs ? `?${qs}` : ''}`;
        try {
            window.history.replaceState(null, '', targetUrl);
        } catch {
            router.replace(targetUrl, { scroll: false });
        }
    }, [pathname, router, searchParams]);

    // Fetch public holidays dynamically for the selected year
    useEffect(() => {
        let isMounted = true;
        setIsLoading(true);
        fetchCambodiaHolidays(selectedYear)
            .then(data => {
                if (isMounted) {
                    setHolidays(data);
                    setIsLoading(false);
                }
            })
            .catch(() => {
                if (isMounted) {
                    setIsLoading(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, [selectedYear]);

    // Allocate Intl formatters for locale
    const intlFormatters = useMemo(() => ({
        monthLong: new Intl.DateTimeFormat(locale, { month: 'long' }),
        weekdayShort: new Intl.DateTimeFormat(locale, { weekday: 'short' }),
        fullDate: new Intl.DateTimeFormat(locale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
    }), [locale]);

    const monthNames = useMemo(() => {
        return Array.from({ length: 12 }).map((_, i) => intlFormatters.monthLong.format(new Date(2000, i, 1)));
    }, [intlFormatters]);

    const availableYears = useMemo(() => {
        const base = new Date().getFullYear();
        const years: number[] = [];
        for (let y = base - 5; y <= base + 6; y++) {
            years.push(y);
        }
        return years;
    }, []);

    const handleYearChange = (yearStr: string | null) => {
        if (!yearStr) return;
        const y = parseInt(yearStr, 10);
        if (!isNaN(y)) {
            startTransition(() => {
                setSelectedYear(y);
                updateUrlParams(y, selectedMonth, locale);
            });
        }
    };

    const handleMonthChange = (monthStr: string | null) => {
        const m = monthStr || 'all';
        setSelectedMonth(m);
        updateUrlParams(selectedYear, m, locale);
    };

    const handleLocaleChange = (newLocale: string | null) => {
        const val = newLocale || 'km-KH';
        setLocale(val);
        updateUrlParams(selectedYear, selectedMonth, val);
    };

    const filteredHolidays = useMemo(() => {
        const query = searchQuery.toLowerCase().trim();
        return holidays.filter(h => {
            const [y, m] = h.date.split('-').map(Number);
            if (selectedMonth !== 'all' && m !== Number(selectedMonth)) {
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
    }, [holidays, searchQuery, selectedMonth]);

    return (
        <div className="w-full relative group">
            {/* Ambient Background Glow */}
            <div className="absolute -inset-0.5 bg-linear-to-r from-rose-500/30 via-purple-500/30 to-teal-500/30 rounded-3xl blur-2xl opacity-40 group-hover:opacity-70 transition duration-1000 group-hover:duration-200 pointer-events-none" />

            <div className="bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-3xl border border-neutral-200 dark:border-white/10 rounded-2xl sm:rounded-3xl p-3 sm:p-6 md:p-8 relative overflow-hidden flex flex-col w-full shadow-xl">
                
                {/* Header Summary & Top Info */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-neutral-200/60 dark:border-white/10 relative z-10">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 sm:p-2.5 bg-rose-500/10 dark:bg-rose-500/20 rounded-xl sm:rounded-2xl border border-rose-500/20 text-rose-600 dark:text-rose-400 shrink-0">
                            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <div>
                            <h2 className="text-base sm:text-xl font-extrabold text-neutral-900 dark:text-white">
                                Public Holidays ({selectedYear})
                            </h2>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                Official Cambodian national holidays with traditional Khmer lunar synchronization
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Language Selector */}
                        <div className="w-32 sm:w-36">
                            <Select value={locale} onValueChange={handleLocaleChange}>
                                <SelectTrigger className="w-full bg-neutral-100/80 dark:bg-white/5 border border-neutral-200/50 dark:border-white/10 text-neutral-900 dark:text-white rounded-xl backdrop-blur-md focus:ring-teal-500 focus:border-teal-500 font-medium text-xs h-9">
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

                        <a
                            href={`https://nagerholidays.com/api/v4/Holidays/KH/${selectedYear}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] text-neutral-400 dark:text-neutral-500 hover:text-teal-600 dark:hover:text-teal-400 transition-colors flex items-center gap-0.5"
                            title="Official Nager.Date Public Holiday API"
                        >
                            API
                            <ArrowUpRight className="w-3 h-3 opacity-60" />
                        </a>
                    </div>
                </div>

                {/* Filter Controls Bar */}
                <div className="flex flex-col gap-3 p-3 sm:p-4 rounded-2xl bg-neutral-100/60 dark:bg-white/5 border border-neutral-200/60 dark:border-white/10 mb-4 relative z-10">
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
                        {/* Search input */}
                        <div className="relative sm:col-span-6 md:col-span-6">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search holiday by name, Khmer name, or date..."
                                className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
                                    aria-label="Clear search"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>

                        {/* Year Selector */}
                        <div className="sm:col-span-3 md:col-span-3">
                            <Select value={String(selectedYear)} onValueChange={handleYearChange}>
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
                            <Select value={selectedMonth} onValueChange={handleMonthChange}>
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
                                {selectedMonth !== 'all' && (
                                    <> in <span className="text-teal-600 dark:text-teal-400 font-semibold">{monthNames[Number(selectedMonth) - 1]}</span></>
                                )}
                                {' '}({selectedYear})
                            </span>
                        </div>

                        {(selectedMonth !== 'all' || searchQuery) && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedMonth('all');
                                    setSearchQuery('');
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 transition-colors cursor-pointer"
                            >
                                <X className="w-3 h-3" />
                                Reset Filters
                            </button>
                        )}
                    </div>
                </div>

                {/* Holiday Cards Grid or Loading Skeleton / Empty State */}
                <div className="relative z-10">
                    {isLoading || isPending ? (
                        <PublicHolidaysSkeleton />
                    ) : filteredHolidays.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-2xl bg-neutral-50/50 dark:bg-white/2 border border-dashed border-neutral-200 dark:border-white/10 animate-in fade-in duration-150">
                            <div className="p-3 rounded-2xl bg-neutral-100 dark:bg-white/5 text-neutral-400 mb-3">
                                <CalendarDays className="w-6 h-6" />
                            </div>
                            <p className="text-sm font-bold text-neutral-900 dark:text-white">
                                No public holidays found
                            </p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm">
                                {selectedMonth !== 'all' || searchQuery
                                    ? "No holidays match your current filter criteria. Try selecting another month or clearing search."
                                    : `There are no recorded public holidays for ${selectedYear}.`}
                            </p>
                            {(selectedMonth !== 'all' || searchQuery) && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedMonth('all');
                                        setSearchQuery('');
                                    }}
                                    className="mt-4 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-teal-500/10 text-teal-600 dark:text-teal-400 hover:bg-teal-500/20 transition-colors cursor-pointer"
                                >
                                    Clear all filters
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-1 animate-in fade-in duration-150">
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
                                            
                                            <Link
                                                href={`/calendar?date=${h.date}`}
                                                className="p-2 rounded-xl bg-neutral-100 dark:bg-white/5 group-hover/card:bg-rose-500 group-hover/card:text-white text-neutral-500 transition-all cursor-pointer shrink-0"
                                                title="View this date in Khmer Lunar Calendar"
                                            >
                                                <CalendarIcon className="w-4 h-4" />
                                            </Link>
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
            </div>
        </div>
    );
}

export default PublicHolidaysWidget;
