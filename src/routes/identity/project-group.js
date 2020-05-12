import express from 'express';
import asyncHandler from 'express-async-handler';
import * as projectGroup from '@controllers/identity/project-group';
import { parameterBuilder, setTagRouter } from '@lib/tag/tag-route';
const router = express.Router();

setTagRouter(parameterBuilder (projectGroup.listProjectGroups, projectGroup.updateProjectGroup, 'project_group_id', router));
const controllers = [
    { url: '/create', func: projectGroup.createProjectGroup },
    { url: '/update', func: projectGroup.updateProjectGroup },
    { url: '/delete', func: projectGroup.deleteProjectGroup },
    { url: '/get', func: projectGroup.getProjectGroup },
    { url: '/member/add', func: projectGroup.addProjectGroupMember },
    { url: '/member/modify', func: projectGroup.modifyProjectGroupMember },
    { url: '/member/remove', func: projectGroup.removeProjectGroupMember },
    { url: '/member/list', func: projectGroup.listProjectGroupMembers },
    { url: '/list-projects', func: projectGroup.listProjects },
    { url: '/list', func: projectGroup.listProjectGroups },
    { url: '/stat', func: projectGroup.statProjectGroups }
];

controllers.map((config) => {
    router.post(config.url, asyncHandler(async (req, res, next) => {
        res.json(await config.func(req.body));
    }));
});

export default router;
