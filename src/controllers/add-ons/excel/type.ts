import { Request } from 'express';
import { Query } from '@lib/grpc-client/type';
import { Template } from '@lib/excel/type';

export interface ExcelExportRequest extends Request {
    body: {
        source: {
            url: string;
            param: Query;
        };
        template: Template;
    }
}
export interface ExcelExportResponse {
    file_link: string;
}
export interface DownloadExcelRequest extends Request {
    query: {
        key: string;
    }
}
