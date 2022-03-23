type Type = 'MENU'|'CLOUD_SERVICE'

export interface RecentListRequestBody {
    type: Type;
    limit?: number;
}

export interface RecentCreateRequestBody {
    type: Type;
    id: string;
    data: any;
}
