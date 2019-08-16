import grpcClient from '@lib/grpc-client';

const treeProject = async (params) => {
    if (!params.query) {
        params.query = {};
    }
    //params.query.minimal = true;

    let identityV1 = await grpcClient.get('identity', 'v1');

    // if (params.itemType == 'project_group') {
    //     let response = await identityV1.ProjectGroup.list(params);
    // } else if (params.itemType == 'project') {
    //     let response = await identityV1.Project.list(params);
    // } else {
    //     throw new Error(`Parameter is invalid. (item_type = ${params.item_type})`);
    // }
    //
    // response.results.map((itemInfo) => {
    //     let item = {
    //         id: (params.itemType == 'project')? itemInfo.project_id : itemInfo.project_group_id,
    //         name: itemInfo.name,
    //         hasChild: true,
    //         itemType: itemInfo
    //     };
    // });

    return {
        items: []
    };
};

export default treeProject;
