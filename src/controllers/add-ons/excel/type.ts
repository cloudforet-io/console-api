import { Request } from 'express';
import { ExcelOptions } from '@lib/excel/type';


export type ExcelExportRequestBody = ExcelOptions|ExcelOptions[]
export interface ExcelExportRequest extends Request {
    body: ExcelExportRequestBody
}
export interface ExcelExportResponse {
    file_link: string;
}
export interface DownloadExcelRequest extends Request {
    query: {
        key: string;
    }
}
