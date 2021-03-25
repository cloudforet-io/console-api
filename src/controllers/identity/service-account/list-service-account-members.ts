
import { listServiceAccounts } from '@controllers/identity/service-account';
import { listRoleBindings } from '@controllers/identity/role-binding';
import logger from '@lib/logger';

const getServiceAccountProjects = async (service_accounts) => {
    const projects = [] as any;

    const response = await listServiceAccounts({
        query: {
            filter: [{
                key: 'service_account_id',
                value: service_accounts,
                operator: 'in'
            }]
        }
    });

    response.results.forEach((serviceAccountInfo) => {
        if (serviceAccountInfo.project_info && serviceAccountInfo.project_info.project_id) {
            if (projects.indexOf(serviceAccountInfo.project_info.project_id) < 0) {
                projects.push(serviceAccountInfo.project_info.project_id);
            }
        }
    });

    return projects;
};

const listServiceAccountMembers = async (params) => {
    const service_accounts = params.service_accounts || [];
    const query = params.query || {};
    let response = {
        results: [],
        total_count: 0
    };

    if (service_accounts.length > 0) {
        const projects = await getServiceAccountProjects(service_accounts);
        query.filter = query.filter = [];
        query.filter.push({
            k: 'project_id',
            v: projects,
            o: 'in'
        });
        response = await listRoleBindings({query: query});
    }
    return response;
};

export default listServiceAccountMembers;
