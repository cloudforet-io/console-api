import { listRoleBindings } from '@controllers/identity/role-binding';
import { getSpotGroup } from '@controllers/spot-automation/spot-group';

const listSpotGroupMembers = async (params) => {
    if (!params.spot_group_id) {
        throw new Error('Required Parameter. (key = spot_group_id)');
    }

    const spotGroupInfo = await getSpotGroup(params);
    const query = params.query || {};
    query.filter = query.filter || [];
    query.filter.push({
        k: 'project_id',
        v: spotGroupInfo.project_id,
        o: 'eq'
    });
    const response = await listRoleBindings({ query: query });
    return response;
};

export default listSpotGroupMembers;
