export interface Query {
    filter?: object[];
    filter_or?: object[];
    page?: object;
    only?: string[];
    distinct?: string;
}

export interface ErrorModel extends Error {
    Error?: any;
    status?: number;
    error_code?: string;
    fail_items?: any;
}

export interface Filter {
    k: string;
    v: any;
    o: string;
}
