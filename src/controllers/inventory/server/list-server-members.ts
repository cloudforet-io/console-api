import { listServers } from '@controllers/inventory/server';
import { listRoleBindings } from '@controllers/identity/role-binding';
import logger from '@lib/logger';

const getServerProjects = async (servers) => {
    const projects = [] as any;

    const response = await listServers({
        query: {
            filter: [{
                key: 'server_id',
                value: servers,
                operator: 'in'
            }]
        }
    });

    response.results.forEach((serverInfo) => {
        if (serverInfo.project_id && projects.indexOf(serverInfo.project_id) < 0) {
            projects.push(serverInfo.project_id);
        }
    });

    return projects;
};

const listServerMembers = async (params) => {
    const servers = params.servers || [];
    const query = params.query || {};
    let response = {
        results: [],
        total_count: 0
    };

    if (servers.length > 0) {
        const projects = await getServerProjects(servers);
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

export default listServerMembers;
