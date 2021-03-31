import express from 'express';
import asyncHandler from 'express-async-handler';
import * as projectGroup from '@controllers/identity/project-group';

const router = express.Router();

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

controllers.forEach((config) => {
    router.post(config.url, asyncHandler(async (req, res) => {
        res.json(await config.func(req.body));
    }));
});

export default router;
