export interface BudgetTemplateData {
    name: string;
    project_or_group_id: string;
    cost_type_key: string;
    cost_type_select?: string;
    start: string;
    end: string;
    time_unit: string;// 'MONTHLY' | 'TOTAL';
}
export interface BudgetBulkCreateSource {
    start?: string;
    end?: string;
    time_unit?: string; // 'MONTHLY' | 'TOTAL';
    cost_types?: Record<string, string[]>;
    projects?: string[];
}
export interface BudgetBulkCreateRequestBody {
    source?: BudgetBulkCreateSource;
    include_values?: boolean;
}
