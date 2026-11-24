import type { MetadataRoute } from 'next';
import { fetchCambodiaHolidays } from '@/lib/holidays';

export const dynamic = 'force-static';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://khmer-datetime.pphat.me';
    const now = new Date();
    const currentYear = now.getFullYear();

    const entries: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: now,
            changeFrequency: 'daily',
            priority: 1.0,
        },
        {
            url: `${baseUrl}/calendar`,
            lastModified: now,
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/holidays`,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/llms.txt`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.5,
        },
    ];

    // Generate date-filtered sitemap entries for past, current, and upcoming years (2024-2028)
    const targetYears = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1, currentYear + 2];

    for (const year of targetYears) {
        // Year filter for holidays
        entries.push({
            url: `${baseUrl}/holidays?year=${year}`,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: year === currentYear ? 0.85 : 0.7,
        });

        // Month filters for calendar and public holidays
        for (let month = 1; month <= 12; month++) {
            entries.push({
                url: `${baseUrl}/calendar/${year}/${String(month).padStart(2, '0')}`,
                lastModified: now,
                changeFrequency: 'weekly',
                priority: year === currentYear ? 0.8 : 0.6,
            });

            entries.push({
                url: `${baseUrl}/holidays?year=${year}&month=${month}`,
                lastModified: now,
                changeFrequency: 'monthly',
                priority: year === currentYear ? 0.75 : 0.55,
            });
        }

        // Specific Public Holiday date entries (/calendar/YYYY/MM/DD)
        try {
            const holidays = await fetchCambodiaHolidays(year);
            for (const h of holidays) {
                if (h.date) {
                    entries.push({
                        url: `${baseUrl}/calendar/${h.date.replace(/-/g, '/')}`,
                        lastModified: now,
                        changeFrequency: 'monthly',
                        priority: year === currentYear ? 0.85 : 0.65,
                    });
                }
            }
        } catch {
            // Ignore fetch errors gracefully during sitemap generation
        }
    }

    // Deduplicate URLs
    const seen = new Set<string>();
    return entries.filter(item => {
        if (seen.has(item.url)) return false;
        seen.add(item.url);
        return true;
    });
}
