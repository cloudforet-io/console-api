export interface Query {
    filter?: Filter[];
    filter_or?: Filter[];
    page?: object;
    only?: string[];
    distinct?: string;
    minimal?: boolean;
    sort?: Sort;
}

export interface Filter {
    k: string;
    v: any;
    o: string;
}

export interface Sort {
    key: string;
    desc?: boolean;
}

export interface ListResponse<T=any> {
    results: T[];
    total_count: number;
}

export interface ListRequest {
    query: Query;
}
