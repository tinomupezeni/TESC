import apiClient from "@/services/api";

export interface MobilityStat {
    direction: string;
    country: string;
    foreign_institution: string;
    gender: string;
    count: number;
}

export interface MobilityReportResponse {
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

export const getMobilityStats = async (filters = {}) => {
    const response = await apiClient.post<MobilityReportResponse>("/v1/reports/dynamic/preview/", {
        report_type: "mobility",
        filters,
        columns: ["student_id_number", "student_name", "direction", "country", "foreign_institution", "gender"]
    });
    return response.data;
};

export const mobilityService = {
    getMobilityStats,
};

export default mobilityService;