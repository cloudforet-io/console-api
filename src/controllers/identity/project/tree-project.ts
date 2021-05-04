//@ts-nocheck
import grpcClient from '@lib/grpc-client';
import _ from 'lodash';
import logger from '@lib/logger';

const getPermissionMap = async (client, params) => {
    const reqParams = {
        author_within: true,
        query: {
            only: ['project_group_id']
        }
    };

    if (params.item_type === 'ROOT') {
        reqParams.query.filter = [{
            k: 'parent_project_group',
            v: null,
            o: 'eq'
        }];
    } else {
        reqParams.parent_project_group_id = params.item_id;
    }

    const res = {};
    const {results: childrenWithPermission} = await client.ProjectGroup.list(reqParams);
    childrenWithPermission.forEach(d => {
        res[d.project_group_id] = true;
    });

    return res;
};

const getProjectGroupChildMap = async (client, groups) => {
    const res = {};

    const {results: allChildren} = await client.ProjectGroup.list({
        query: {
            only: ['parent_project_group_info.project_group_id'],
            filter: [{
                k: 'parent_project_group_id',
                v: groups.map(d => d.project_group_id),
                o: 'in'
            }]
        }
    });

    allChildren.forEach(d => {
        res[d.parent_project_group_info.project_group_id] = true;
    });

    return res;
};

const getProjectChildMap = async (client, groups) => {
    const res = {};

    const {results: allChildren} = await client.Project.list({
        query: {
            only: ['project_group_info.project_group_id'],
            filter: [{
                k: 'project_group_id',
                v: groups.map(d => d.project_group_id),
                o: 'in'
            }]
        }
    });

    allChildren.forEach(d => {
        res[d.project_group_info.project_group_id] = true;
    });

    return res;
};

const getHasChildMap = async (client, groups, excludeType) => {
    let res = {};

    if (excludeType !== 'PROJECT') {
        res = {...res, ...await getProjectChildMap(client, groups)};
    }
    if (excludeType !== 'PROJECT_GROUP')  {
        res = {...res, ...await getProjectGroupChildMap(client, groups)};
    }

    return res;
};

const getProjectGroups = async (client, params) => {
    const reqParams = {
        query: params.query
    };

    if (params.item_type === 'ROOT') {
        reqParams.query.filter = [{
            k: 'parent_project_group',
            v: null,
            o: 'eq'
        }];
    } else {
        reqParams.parent_project_group_id = params.item_id;
    }

    const {results: groups} = await client.ProjectGroup.list(reqParams);

    let hasPermissionMap = {};
    if (params.include_permission) {
        hasPermissionMap = await getPermissionMap(client, params);
    }

    let hasChildMap = {};
    if (params.check_child) {
        hasChildMap = await getHasChildMap(client, groups);
    }

    const res = groups.map(d => {
        const item = {
            id: d.project_group_id,
            name: d.name,
            item_type: 'PROJECT_GROUP',
            has_child: null,
            has_permission: null
        };

        if (params.include_permission) {
            item.has_permission = !!hasPermissionMap[d.project_group_id];
        }

        if (params.check_child) {
            item.has_child = !!hasChildMap[d.project_group_id];
        }

        return item;
    });

    return res;
};

const getProjects = async (client, params) => {
    if (params.item_type == 'ROOT') {
        return [];
    }

    const reqParams = {
        query: params.query,
        project_group_id: params.item_id || null
    };

    const response = await client.Project.list(reqParams);
    const items = [];
    response.results.forEach((itemInfo) => {
        const item = {
            id: itemInfo.project_id,
            name: itemInfo.name,
            item_type: 'PROJECT',
            has_child: false,
            has_permission: true
        };
        items.push(item);
    });

    return items;
};

const getParentItem = async (client, itemId, itemType, openItems = []) => {
    const reqParams = {
        query: {}
    };

    if (itemType == 'PROJECT') {
        reqParams.project_id = itemId;
        const response = await client.Project.list(reqParams);

        if (response.total_count == 1) {
            const projectInfo = response.results[0];
            openItems.unshift(projectInfo.project_id);

            const parentItemId = _.get(projectInfo, 'project_group_info.project_group_id');
            if (parentItemId) {
                await getParentItem(
                    client,
                    parentItemId,
                    'PROJECT_GROUP',
                    openItems
                );
            }
        }
    } else {
        reqParams.project_group_id = itemId;
        const response = await client.ProjectGroup.list(reqParams);

        if (response.total_count == 1) {
            const projectGroupInfo = response.results[0];
            openItems.unshift(projectGroupInfo.project_group_id);

            const parentItemId = _.get(projectGroupInfo, 'parent_project_group_info.project_group_id');
            if (parentItemId) {

                await getParentItem(
                    client,
                    parentItemId,
                    'PROJECT_GROUP',
                    openItems
                );
            }
        }
    }

    return openItems;
};

export const treeProject = async (params) => {
    if (!params.item_type) {
        throw new Error('Required Parameter. (key = item_type)');
    }

    if (params.item_type !== 'ROOT' && !params.item_id) {
        throw new Error('Required Parameter. (key = item_id)');
    }

    if (!params.query) {
        params.query = {};
    }
    params.query.minimal = true;

    if (params.sort) {
        params.query.sort = params.sort;
    }

    const identityV1 = await grpcClient.get('identity', 'v1');
    const response = { items: [] };

    Array.prototype.push.apply(response.items, await getProjectGroups(identityV1, params));

    if(params.exclude_type !== 'PROJECT'){
        try {
            Array.prototype.push.apply(response.items, await getProjects(identityV1, params));
        } catch (e) {
            logger.error(`PROJECT LOAD ERROR: ${e}`);
        }
    }

    return response;
};

export const treePathSearchProject = async (params) => {
    if (!params.item_type) {
        throw new Error('Required Parameter. (key = item_type)');
    }

    if (['PROJECT_GROUP', 'PROJECT'].indexOf(params.item_type) === -1) {
        throw new Error(`Invalid item type. (key = item_type) : ${params.item_type}`);
    }

    if (params.item_type !== 'ROOT' && !params.item_id) {
        throw new Error('Required Parameter. (key = item_id)');
    }

    if (!params.query) {
        params.query = {};
    }
    params.query.minimal = true;

    if (params.sort) {
        params.query.sort = params.sort;
    }

    const identityV1 = await grpcClient.get('identity', 'v1');

    const response = {
        open_path: []
    };

    response.open_path = await getParentItem(
        identityV1,
        params.item_id,
        params.item_type);

    return response;
};
