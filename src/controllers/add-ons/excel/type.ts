import { Request } from 'express';
import { SourceParam, Template } from '@lib/excel/type';

export interface ExcelExportOptions {
    source: {
        url: string;
        param: SourceParam;
    };
    template: Template;
}
export interface ExcelExportRequest extends Request {
    body: ExcelExportOptions|ExcelExportOptions[]
}
export interface ExcelExportResponse {
    file_link: string;
}
export interface DownloadExcelRequest extends Request {
    query: {
        key: string;
    }
}
