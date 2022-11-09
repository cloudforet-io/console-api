export const recentType = ['MENU', 'CLOUD_SERVICE', 'PROJECT', 'PROJECT_GROUP', 'DASHBOARD'] as const;
type RecentType = typeof recentType[number]

export interface RecentListRequestBody {
    type: RecentType;
    limit?: number;
}

export interface RecentCreateRequestBody {
    type: RecentType;
    id: string;
}
