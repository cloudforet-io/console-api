export interface Query {
    filter?: Filter[];
    filter_or?: Filter[];
    page?: object;
    only?: string[];
    distinct?: string;
    minimal?: boolean;
    sort?: Sort;
}

interface LongFilter {
    key: string;
    value: any;
    operator: string;
}

interface ShortFilter {
    k: string;
    v: any;
    o: string;
}

export type Filter = LongFilter | ShortFilter;

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
