import { ListRequest, ListResponse, Query, Sort } from '@lib/grpc-client/type';

interface ProjectGroupModel {
    project_group_id: string;
    name: string;
    parent_project_group_info: {
        project_group_id: string;
    }
}

interface ProjectModel {
    project_id: string;
    name: string;
    project_group_info: {
        project_group_id: string;
    }
}

export interface ProjectOrGroupListRequest extends ListRequest {
    author_within?: boolean,
    parent_project_group_id?: string;
    project_id?: string;
    project_group_id?: string;
}

export type ProjectGroupListResponse = ListResponse<ProjectGroupModel>
export type ProjectListResponse = ListResponse<ProjectModel>

export type ItemType = 'PROJECT_GROUP'|'PROJECT'|'ROOT'

export interface ProjectTreeRequest {
    item_type: ItemType;
    item_id?: string;
    include_permission?: boolean;
    check_child?: boolean;
    exclude_type?: ItemType;
    query?: Query;
    sort?: Sort;
}

export interface TreeItem {
    id: string;
    name: string;
    item_type: ItemType;
    has_child: boolean|null;
    has_permission: boolean|null;
}

export interface ProjectTreeResponse {
    items: TreeItem[]
}

export interface ProjectTreeSearchRequest {
    item_type: ItemType;
    item_id?: string;
    query?: Query;
    sort?: Sort;
}

export interface ProjectTreeSearchResponse {
    open_path: string[];
}
