import type { Metadata } from 'next';
import { CalendarView } from '@/components/calendar-view';
import { DateDetailView } from '@/components/date-detail-view';
import { fetchCambodiaHolidays } from '@/lib/holidays';

export async function generateStaticParams() {
    const currentYear = new Date().getFullYear();
    const targetYears = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1, currentYear + 2];
    const paramsList: { slug: string[] }[] = [];

    for (const year of targetYears) {
        const yStr = String(year);
        // /calendar/YYYY
        paramsList.push({ slug: [yStr] });

        // /calendar/YYYY/MM and /calendar/YYYY/M
        for (let m = 1; m <= 12; m++) {
            const mPad = String(m).padStart(2, '0');
            const mRaw = String(m);
            paramsList.push({ slug: [yStr, mPad] });
            if (mPad !== mRaw) {
                paramsList.push({ slug: [yStr, mRaw] });
            }
        }

        // Specific Public Holiday dates: /calendar/YYYY/MM/DD and unpadded variants
        try {
            const holidays = await fetchCambodiaHolidays(year);
            for (const h of holidays) {
                if (h.date) {
                    const [y, m, d] = h.date.split('-');
                    if (y && m && d) {
                        const mNum = parseInt(m, 10);
                        const dNum = parseInt(d, 10);
                        paramsList.push({ slug: [y, m, d] });
                        paramsList.push({ slug: [y, String(mNum), String(dNum)] });
                        paramsList.push({ slug: [y, m, String(dNum)] });
                        paramsList.push({ slug: [y, String(mNum), d] });
                    }
                }
            }
        } catch {
            // Ignore fetch errors during static params generation
        }
    }

    // Always ensure current date and surrounding days are statically pre-rendered
    const now = new Date();
    const nowY = String(now.getFullYear());
    const nowM = String(now.getMonth() + 1).padStart(2, '0');
    const nowD = String(now.getDate()).padStart(2, '0');
    paramsList.push({ slug: [nowY, nowM, nowD] });
    paramsList.push({ slug: [nowY, String(now.getMonth() + 1), String(now.getDate())] });
    paramsList.push({ slug: [nowY, nowM, String(now.getDate())] });

    // Deduplicate
    const seen = new Set<string>();
    return paramsList.filter(p => {
        const key = p.slug.join('/');
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
    const { slug } = await params;
    const year = slug[0];
    const month = slug[1];
    const day = slug[2];

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    let dynamicTitle = `Khmer Lunar Calendar ${year || ''} | ប្រតិទិនចន្ទគតិខ្មែរ`;
    let dynamicDesc = `Explore the Khmer lunar calendar for ${year || ''}. Check Buddhist Era, moon phases, and Cambodian holidays.`;

    if (year && month && day) {
        const mIdx = parseInt(month, 10) - 1;
        const mName = monthNames[mIdx] || month;
        dynamicTitle = `Khmer Lunar Date: ${mName} ${parseInt(day, 10)}, ${year} | ប្រតិទិនចន្ទគតិខ្មែរ`;
        dynamicDesc = `Exact Khmer lunar date details for ${mName} ${day}, ${year}. Check waxing and waning moon phase, Buddhist Era, and Cambodian holidays.`;
    } else if (year && month) {
        const mIdx = parseInt(month, 10) - 1;
        const mName = monthNames[mIdx] || month;
        dynamicTitle = `Khmer Lunar Calendar ${mName} ${year} | ប្រតិទិនចន្ទគតិខ្មែរ`;
        dynamicDesc = `Monthly Khmer lunar calendar for ${mName} ${year}. View Buddhist holy days (ថ្ងៃសីល), moon phases, and Cambodian public holidays.`;
    }

    return {
        title: dynamicTitle,
        description: dynamicDesc,
        openGraph: {
            title: dynamicTitle,
            description: dynamicDesc,
            url: `https://khmer-datetime.pphat.me/calendar/${slug.join('/')}`,
            images: [
                {
                    url: "/thumbnail/calendar.webp",
                    width: 1200,
                    height: 630,
                    alt: dynamicTitle,
                }
            ]
        },
        twitter: {
            card: "summary_large_image",
            title: dynamicTitle,
            description: dynamicDesc,
            images: ["/thumbnail/calendar.webp"]
        }
    };
}

export default async function CalendarSlugPage({
    params,
}: {
    params: Promise<{ slug: string[] }>;
}) {
    const { slug } = await params;
    if (slug && slug.length >= 3) {
        const y = parseInt(slug[0], 10);
        const m = parseInt(slug[1], 10);
        const d = parseInt(slug[2], 10);
        if (!isNaN(y) && !isNaN(m) && !isNaN(d) && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
            return <DateDetailView year={y} month={m} day={d} />;
        }
    }
    return <CalendarView slug={slug} />;
}
