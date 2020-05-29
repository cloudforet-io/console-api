import express from 'express';
// @ts-ignore
import {proxyHandler} from '@controllers/proxy';
import asyncHandler from 'express-async-handler';
import {proxyClient} from '@controllers/proxy/client';
import addOnsRouter from "../add-ons";

import * as secret from "@controllers/secret/secret";
import * as secretGroup from "@controllers/secret/secret-group";
import * as project from "@controllers/identity/project";
import {treePathSearchProject, treeProject} from "@controllers/identity/project/tree-project";
import * as projectGroup from "@controllers/identity/project-group";
import * as serviceAccount from "@controllers/identity/service-account";
import listServiceAccountMembers from "@controllers/identity/service-account/list-service-account-members";
import * as user from "@controllers/identity/user";
import * as supervisor from "@controllers/plugin/supervisor";
import * as server from "@controllers/inventory/server";
import serverGetData from "@controllers/inventory/server/get-data";
import listServerMembers from "@controllers/inventory/server/list-server-members";
import * as cloudService from "@controllers/inventory/cloud-service";
import cloudServiceGetData from "@controllers/inventory/cloud-service/get-data";
import listCloudServiceMembers from "@controllers/inventory/cloud-service/list-cloud-service-members";
import * as collector from "@controllers/inventory/collector";


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
const router = express.Router();
router.use('/add-ons', addOnsRouter);

const controllers: {url: string, func: any}[] = [
    { url: '/secret/secret/create', func: secret.createSecret },
    { url: '/secret/secret-group/secret/add', func: secretGroup.addSecret },
    { url: '/secret/secret-group/secret/remove', func: secretGroup.removeSecret },

    { url: '/plugin/supervisor/plugin/recover', func: supervisor.recoverPlugin },

    { url: '/identity/project/delete', func: project.deleteProject },
    { url: '/identity/project/get', func: project.getProject },
    { url: '/identity/project/list', func: project.listProjects },
    { url: '/identity/project/member/add', func: project.addProjectMember },
    { url: '/identity/project/member/remove', func: project.removeProjectMember },
    { url: '/identity/project/tree', func: treeProject },
    { url: '/identity/project/tree/search', func: treePathSearchProject },
    { url: '/identity/project-group/member/remove', func: projectGroup.removeProjectGroupMember },
    { url: '/identity/project-group/member/add', func: projectGroup.addProjectGroupMember },
    { url: '/identity/project-group/list-projects', func: projectGroup.listProjects },
    { url: '/identity/service-account/change-project', func: serviceAccount.changeServiceAccountProject },
    { url: '/identity/service-account/member/list', func: listServiceAccountMembers },
    { url: '/identity/user/delete', func: user.deleteUsers },
    { url: '/identity/user/enable', func: user.enableUsers },
    { url: '/identity/user/disable', func: user.disableUsers },

    { url: '/inventory/server/change-state', func: server.changeServerState },
    { url: '/inventory/server/change-project', func: server.changeServerProject },
    { url: '/inventory/server/change-pool', func: server.changeServerPool },
    { url: '/inventory/server/delete', func: server.deleteServers },
    { url: '/inventory/server/get-data', func: serverGetData },
    { url: '/inventory/server/member/list', func: listServerMembers },

    { url: '/inventory/cloud-service/change-region', func: cloudService.changeCloudServiceRegion },
    { url: '/inventory/cloud-service/change-project', func: cloudService.changeCloudServiceProject },
    { url: '/inventory/cloud-service/delete', func: cloudService.changeCloudServiceRegion },
    { url: '/inventory/cloud-service/get-data', func: cloudServiceGetData },
    { url: '/inventory/cloud-service/member/list', func: listCloudServiceMembers },

    { url: '/inventory/collector/enable', func: collector.enableCollectors },
    { url: '/inventory/collector/disable', func: collector.disableCollectors },
    { url: '/inventory/collector/delete', func: collector.deleteCollectors },
];
controllers.forEach((config) => {
    router.post(config.url, asyncHandler(async (req, res, next) => {
        res.json(await config.func(req.body));
    }));
});
router.post('/*', asyncHandler(proxyHandler(getClient)));

export default router;
