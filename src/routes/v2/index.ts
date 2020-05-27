import express from 'express';
// @ts-ignore
import {proxyHandler} from '@controllers/proxy';

import asyncHandler from 'express-async-handler';

const router = express.Router();



import {proxyClient} from '@controllers/proxy/client';

const resourceMap = {
    identity: {
        "api-key": "APIKey",
        authorization: "Authorization",
        domain: "Domain",
        "domain-owner": "DomainOwner",
        policy: "Policy",
        project: "Project",
        "project-group": "ProjectGroup",
        provider: "Provider",
        role: "Role",
        "service-account": "ServiceAccount",
        token: "Token",
        user: "User",
    },
    repository: {
        plugin: "Plugin",
        repository: "Repository",
        schema: "Schema",
    },
    secret: {
        secret: "Secret",
        "secret-group": "SecretGroup",
    },
    inventory: {
        'cloud-service': "CloudService",
        'cloud-service-type': "CloudServiceType",
        collector: "Collector",
        'ip-address': "IPAddress",
        job: "Job",
        network: "Network",
        'network-policy': "NetworkPolicy",
        'network-type': "NetworkType",
        pool: "Pool",
        region: "Region",
        server: "Server",
        subnet: "Subnet",
        zone: "Zone",
    },
    plugin: {
        plugin: "Plugin",
        supervisor: "Supervisor"
    },
    monitoring: {
        'data-source': "DataSource",
        log: "Log",
        metric: "Metric"
    },
    statistics: {
        history: "History",
        resource: "Resource",
        schedule: "Schedule",
    },
    config: {
        'config-map': "ConfigMap"
    },
};


const getClient = (paths:string[])=>{
    try {
        const [service,resource,method,...extra ]= paths;
        return proxyClient.get(service,'v1',resourceMap[service][resource],method)
    } catch (e) {
        return null
    }

}

router.post('/*', asyncHandler(proxyHandler(getClient)));

export default router;
