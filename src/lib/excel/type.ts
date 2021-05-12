/* reference */
export type Reference = {
    reference_key: string;
    resource_type: string;
}
export interface ReferenceResourceMap {
    [key: string]: {
        key: string;
        name: string;
    }
}

/* template */
export const FIELD_TYPE = {
    datetime: 'datetime',
    enum: 'enum'
};
export type FieldType = keyof typeof FIELD_TYPE;
export interface TemplateField {
    key: string;
    name: string;
    type?: FieldType;
    reference?: Reference;
    enum_items?: {
        [key: string]: string;
    };
}
export interface TemplateOption {
    timezone: string;
    file_name_prefix?: string;
    sheet_name?: string;
}
export interface Template {
    fields: Array<TemplateField>;
    options: TemplateOption;
}

/* excel */
export interface ExcelData {
    [key: string]: string;
}
