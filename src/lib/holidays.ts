export interface PublicHoliday {
    date: string; // YYYY-MM-DD
    name: string;
    countryCode: string;
    nationalHoliday: boolean;
    subdivisionCodes: string[] | null;
    holidayTypes: string[];
}

export interface EnrichedHoliday extends PublicHoliday {
    khmerName?: string;
    lunarDateString?: string;
}

// Khmer translations for standard Cambodian public holidays
export const KHMER_HOLIDAY_NAMES: Record<string, string> = {
    "New Year's Day": "ទិវាចូលឆ្នាំសកល",
    "Victory over Genocide Day": "ទិវាជ័យជម្នះលើរបបប្រល័យពូជសាសន៍",
    "International Women's Day": "ទិវានារីអន្តរជាតិ",
    "Khmer New Year": "ពិធីបុណ្យចូលឆ្នាំថ្មីប្រពៃណីជាតិ",
    "Labour Day": "ទិវាពលកម្មអន្តរជាតិ",
    "Royal Ploughing Ceremony": "ព្រះរាជពិធីច្រត់ព្រះនង្គ័ល",
    "King Sihamoni's Birthday": "ព្រះរាជពិធីបុណ្យចម្រើនព្រះជន្ម ព្រះករុណា ព្រះបាទសម្តេច ព្រះបរមនាថ នរោត្តម សីហមុនី",
    "Queen Mother's Birthday": "ព្រះរាជពិធីបុណ្យចម្រើនព្រះជន្ម សម្តេចព្រះមហាក្សត្រី នរោត្តម មុនិនាថ សីហនុ",
    "Constitution Day": "ទិវាប្រកាសរដ្ឋធម្មនុញ្ញ",
    "Pchum Ben": "ពិធីបុណ្យភ្ជុំបិណ្ឌ",
    "Commemoration Day of the King's Father": "ទិវារំលឹកវិញ្ញាណក្ខន្ធ ព្រះករុណា ព្រះបរមរតនកោដ្ឋ",
    "Coronation Day of King Sihamoni": "ព្រះរាជពិធីគ្រងរាជសម្បត្តិ ព្រះករុណា ព្រះបាទសម្តេច ព្រះបរមនាថ នរោត្តម សីហមុនី",
    "National Independence Day": "ទិវាបុណ្យឯករាជ្យជាតិ",
    "Water Festival": "ព្រះរាជពិធីបុណ្យអុំទូក បណ្តែតប្រទីប និងសំពះព្រះខែ",
    "Cambodia Peace Day": "ទិវាសន្តិភាពនៅកម្ពុជា",
    "Meak Bochea": "ពិធីបុណ្យមាឃបូជា",
    "Visak Bochea": "ពិធីបុណ្យវិសាខបូជា",
    "Children's Day": "ទិវាកុមារអន្តរជាតិ",
    "Paris Peace Agreements Day": "ទិវារំលឹកកិច្ចព្រមព្រៀងសន្តិភាពទីក្រុងប៉ារីស",
    "Human Rights Day": "ទិវាសិទ្ធិមនុស្សអន្តរជាតិ"
};

// Short Khmer names for compact calendar day cell tags
export const SHORT_KHMER_HOLIDAY_NAMES: Record<string, string> = {
    "New Year's Day": "ចូលឆ្នាំសកល",
    "Victory over Genocide Day": "៧ មករា",
    "International Women's Day": "ទិវាសិទ្ធិនារី",
    "Khmer New Year": "ចូលឆ្នាំខ្មែរ",
    "Labour Day": "ទិវាពលកម្ម",
    "Royal Ploughing Ceremony": "ច្រត់ព្រះនង្គ័ល",
    "King Sihamoni's Birthday": "ព្រះជន្មព្រះមហាក្សត្រ",
    "Queen Mother's Birthday": "ព្រះជន្មសម្តេចម៉ែ",
    "Constitution Day": "ទិវារដ្ឋធម្មនុញ្ញ",
    "Pchum Ben": "បុណ្យភ្ជុំបិណ្ឌ",
    "Commemoration Day of the King's Father": "ព្រះបរមរតនកោដ្ឋ",
    "Coronation Day of King Sihamoni": "គ្រងរាជសម្បត្តិ",
    "National Independence Day": "បុណ្យឯករាជ្យ",
    "Water Festival": "បុណ្យអុំទូក",
    "Cambodia Peace Day": "ទិវាសន្តិភាព",
    "Meak Bochea": "មាឃបូជា",
    "Visak Bochea": "វិសាខបូជា",
};

// Fallback dataset for 2026 to ensure zero-failure offline reliability
const FALLBACK_2026_HOLIDAYS: PublicHoliday[] = [
    { date: "2026-01-01", name: "New Year's Day", countryCode: "KH", nationalHoliday: true, subdivisionCodes: null, holidayTypes: ["Public"] },
    { date: "2026-01-07", name: "Victory over Genocide Day", countryCode: "KH", nationalHoliday: true, subdivisionCodes: null, holidayTypes: ["Public"] },
    { date: "2026-03-08", name: "International Women's Day", countryCode: "KH", nationalHoliday: true, subdivisionCodes: null, holidayTypes: ["Public"] },
    { date: "2026-04-14", name: "Khmer New Year", countryCode: "KH", nationalHoliday: true, subdivisionCodes: null, holidayTypes: ["Public"] },
    { date: "2026-04-15", name: "Khmer New Year", countryCode: "KH", nationalHoliday: true, subdivisionCodes: null, holidayTypes: ["Public"] },
    { date: "2026-04-16", name: "Khmer New Year", countryCode: "KH", nationalHoliday: true, subdivisionCodes: null, holidayTypes: ["Public"] },
    { date: "2026-05-01", name: "Labour Day", countryCode: "KH", nationalHoliday: true, subdivisionCodes: null, holidayTypes: ["Public"] },
    { date: "2026-05-05", name: "Royal Ploughing Ceremony", countryCode: "KH", nationalHoliday: true, subdivisionCodes: null, holidayTypes: ["Public"] },
    { date: "2026-05-14", name: "King Sihamoni's Birthday", countryCode: "KH", nationalHoliday: true, subdivisionCodes: null, holidayTypes: ["Public"] },
    { date: "2026-06-18", name: "Queen Mother's Birthday", countryCode: "KH", nationalHoliday: true, subdivisionCodes: null, holidayTypes: ["Public"] },
    { date: "2026-09-24", name: "Constitution Day", countryCode: "KH", nationalHoliday: true, subdivisionCodes: null, holidayTypes: ["Public"] },
    { date: "2026-10-10", name: "Pchum Ben", countryCode: "KH", nationalHoliday: true, subdivisionCodes: null, holidayTypes: ["Public"] },
    { date: "2026-10-11", name: "Pchum Ben", countryCode: "KH", nationalHoliday: true, subdivisionCodes: null, holidayTypes: ["Public"] },
    { date: "2026-10-12", name: "Pchum Ben", countryCode: "KH", nationalHoliday: true, subdivisionCodes: null, holidayTypes: ["Public"] },
    { date: "2026-10-15", name: "Commemoration Day of the King's Father", countryCode: "KH", nationalHoliday: true, subdivisionCodes: null, holidayTypes: ["Public"] },
    { date: "2026-10-29", name: "Coronation Day of King Sihamoni", countryCode: "KH", nationalHoliday: true, subdivisionCodes: null, holidayTypes: ["Public"] },
    { date: "2026-11-09", name: "National Independence Day", countryCode: "KH", nationalHoliday: true, subdivisionCodes: null, holidayTypes: ["Public"] },
    { date: "2026-11-23", name: "Water Festival", countryCode: "KH", nationalHoliday: true, subdivisionCodes: null, holidayTypes: ["Public"] },
    { date: "2026-11-24", name: "Water Festival", countryCode: "KH", nationalHoliday: true, subdivisionCodes: null, holidayTypes: ["Public"] },
    { date: "2026-11-25", name: "Water Festival", countryCode: "KH", nationalHoliday: true, subdivisionCodes: null, holidayTypes: ["Public"] },
    { date: "2026-12-29", name: "Cambodia Peace Day", countryCode: "KH", nationalHoliday: true, subdivisionCodes: null, holidayTypes: ["Public"] }
];

// In-memory cache by year
const holidaysCache = new Map<number, PublicHoliday[]>();

/**
 * Format local Date to YYYY-MM-DD string
 */
export function formatDateKey(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

/**
 * Fetch Cambodia public holidays for a specific year
 */
export async function fetchCambodiaHolidays(year: number): Promise<PublicHoliday[]> {
    if (holidaysCache.has(year)) {
        return holidaysCache.get(year)!;
    }

    // Try primary API: Nager Holidays v4
    try {
        const response = await fetch(`https://nagerholidays.com/api/v4/Holidays/KH/${year}`, {
            headers: { 'Accept': 'application/json' },
            cache: 'force-cache'
        });
        if (response.ok) {
            const data: PublicHoliday[] = await response.json();
            if (Array.isArray(data) && data.length > 0) {
                holidaysCache.set(year, data);
                return data;
            }
        }
    } catch (e) {
        console.warn(`Failed to fetch from nagerholidays.com v4 for ${year}, trying fallback endpoint...`, e);
    }

    // Try secondary API: date.nager.at v3
    try {
        const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/KH`, {
            headers: { 'Accept': 'application/json' }
        });
        if (response.ok) {
            const data: PublicHoliday[] = await response.json();
            if (Array.isArray(data) && data.length > 0) {
                holidaysCache.set(year, data);
                return data;
            }
        }
    } catch (e) {
        console.warn(`Failed to fetch from date.nager.at v3 for ${year}`, e);
    }

    // Fallback to static data if 2026
    if (year === 2026) {
        holidaysCache.set(2026, FALLBACK_2026_HOLIDAYS);
        return FALLBACK_2026_HOLIDAYS;
    }

    return [];
}
