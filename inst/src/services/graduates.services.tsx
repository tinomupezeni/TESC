import apiClient from './api';

export interface GraduationStat {
    id: string;
    year: string;
    program: string;
    level: string;
    graduates: number;
    passRate: string;
    distinction: number;
    credit: number;
    pass: number;
}

export async function getGraduationStats(institutionId: number): Promise<GraduationStat[]> {
    // Placeholder - replace with actual API call
    console.log(`Fetching graduation stats for institution: ${institutionId}`);
    return [
        {
            id: "GRAD001",
            year: "2024",
            program: "Computer Science",
            level: "National Diploma",
            graduates: 78,
            passRate: "94%",
            distinction: 12,
            credit: 45,
            pass: 21,
        },
        {
            id: "GRAD002",
            year: "2024",
            program: "Engineering",
            level: "Higher National Diploma",
            graduates: 65,
            passRate: "89%",
            distinction: 8,
            credit: 38,
            pass: 19,
        },
    ];
}
