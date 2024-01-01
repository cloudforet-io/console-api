export const recentType = ['MENU', 'CLOUD_SERVICE', 'PROJECT', 'PROJECT_GROUP', 'DASHBOARD', 'COST_ANALYSIS'] as const;
type RecentType = typeof recentType[number]

export interface RecentListRequestBody {
    type: RecentType;
    limit?: number;
}

export interface RecentCreateRequestBody {
    type: RecentType;
    workspace_id: string;
    id: string;
}
