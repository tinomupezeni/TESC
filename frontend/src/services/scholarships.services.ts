import apiClient from "@/services/api";

export interface ScholarshipStat {
    provider_name: string;
    amount: number;
    year_awarded: number;
    institution_name: string;
    program_name: string;
    gender: string;
    count: number;
}

export interface ScholarshipsReportResponse {
    data: any[];
    total: number;
    metrics: {
        total: number;
        male_count: number;
        female_count: number;
        male_pct: number;
        female_pct: number;
    };
}

export const getScholarshipsStats = async (filters = {}) => {
    const response = await apiClient.post<ScholarshipsReportResponse>("/v1/reports/dynamic/preview/", {
        report_type: "scholarships",
        filters,
        columns: ["student_id_number", "student_name", "provider_name", "amount", "year_awarded", "gender"]
    });
    return response.data;
};

export const scholarshipService = {
    getScholarshipsStats,
};

export default scholarshipService;