import apiClient from "@/services/api";

export interface PlacementStat {
    placement_type: string;
    company_name: string;
    institution_name: string;
    program_name: string;
    gender: string;
    count: number;
}

export interface PlacementsReportResponse {
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

export const getPlacementsStats = async (filters = {}) => {
    const response = await apiClient.post<PlacementsReportResponse>("/v1/reports/dynamic/preview/", {
        report_type: "placements",
        filters,
        columns: ["student_id_number", "student_name", "placement_type", "company_name", "institution_name", "gender"]
    });
    return response.data;
};

export const placementService = {
    getPlacementsStats,
};

export default placementService;