import { ExcelExportRequestBody } from '@controllers/add-ons/excel/type';
import { Query } from '@lib/grpc-client/type';

/* reference */
export type Reference = {
    reference_key: string;
    resource_type: string;
}

/* template */
export const FIELD_TYPE = {
    datetime: 'datetime',
    enum: 'enum'
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
}

interface HeaderMessage {
    title: string;
}
interface TemplateOption {
    timezone: string;
    file_name_prefix?: string;
    sheet_name?: string;
    header_message: HeaderMessage;
}
export interface Template {
    fields: Array<TemplateField>;
    options: TemplateOption;
}

/* excel */
export interface ExcelData {
    [key: string]: string;
}
export interface ExcelOptions {
    source: {
        url: string;
        param: Query;
    };
    template: Template;
}
/* redis */
export interface RedisParam {
    req_body: ExcelExportRequestBody;
    auth_info: {
        token: string;
        user_id: string;
        domain_id: string;
        user_type: string;
    }
}
