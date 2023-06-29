import { ExcelExportOptions } from '@controllers/add-ons/excel/type';
import { Query } from '@lib/grpc-client/type';

/* reference */
export type Reference = {
    reference_key: string;
    resource_type: string;
}

export const CURRENCY = Object.freeze({
    USD: 'USD',
    KRW: 'KRW',
    JPY: 'JPY'
});
export type CURRENCY = typeof CURRENCY[keyof typeof CURRENCY]

/* template */
interface Options {
    currency?: string;
    currencyRates?: Record<string, number>;
    // for dynamic field options
    key_depth?: number|null;
}
export const FIELD_TYPE = {
    datetime: 'datetime',
    enum: 'enum',
    currency: 'currency'
} as const;
export type FieldType = typeof FIELD_TYPE[keyof typeof FIELD_TYPE];
export interface TemplateField {
    key: string;
    name: string;
    type?: FieldType;
    reference?: Reference;
    enum_items?: {
        [key: string]: string;
    };
    options?: Options;
}

export interface HeaderMessage {
    title: string;
}
export interface TemplateOptions {
    timezone: string;
    file_name_prefix?: string;
    sheet_name?: string;
    header_message?: HeaderMessage;
}
export interface Template {
    fields: Array<TemplateField>;
    options: TemplateOptions;
}

/* excel data */
export interface ExcelData {
    [key: string]: string;
}

/* excel options */
export interface Source {
    url?: string;
    param?: SourceParam;
    data?: any[];
}
export interface SourceParam {
    query: Query
}
export interface ExcelOptions {
    source?: Source;
    template: Template;
}
/* redis */
export interface RedisParam {
    req_body: ExcelExportOptions|ExcelExportOptions[];
    auth_info: {
        token: string;
        user_id: string;
        domain_id: string;
        user_type: string;
    }
}
