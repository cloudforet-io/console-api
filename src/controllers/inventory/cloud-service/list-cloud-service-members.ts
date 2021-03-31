import { listCloudServices } from '@controllers/inventory/cloud-service';
import { listRoleBindings } from '@controllers/identity/role-binding';
import logger from '@lib/logger';

const getCloudServiceProjects = async (cloud_services) => {
    const projects = [] as any;

    const response = await listCloudServices({
        query: {
            filter: [{
                key: 'cloud_service_id',
                value: cloud_services,
                operator: 'in'
            }]
        }
    });

    response.results.forEach((cloudServiceInfo) => {
        if (cloudServiceInfo.project_id && projects.indexOf(cloudServiceInfo.project_id) < 0) {
            projects.push(cloudServiceInfo.project_id);
        }
    });

    return projects;
};

const listCloudServiceMembers = async (params) => {
    const cloud_services = params.cloud_services || [];
    const query = params.query || {};
    let response = {
        results: [],
        total_count: 0
    };

    if (cloud_services.length > 0) {
        const projects = await getCloudServiceProjects(cloud_services);
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

export default listCloudServiceMembers;
