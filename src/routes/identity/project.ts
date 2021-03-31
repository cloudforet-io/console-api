import express from 'express';
import asyncHandler from 'express-async-handler';
import * as project from '@controllers/identity/project';
import { treeProject, treePathSearchProject } from '@controllers/identity/project/tree-project';

const router = express.Router();

const controllers = [
    { url: '/create', func: project.createProject },
    { url: '/update', func: project.updateProject },
    { url: '/delete', func: project.deleteProject },
    { url: '/get', func: project.getProject },
    { url: '/member/add', func: project.addProjectMember },
    { url: '/member/modify', func: project.modifyProjectMember },
    { url: '/member/remove', func: project.removeProjectMember },
    { url: '/member/list', func: project.listProjectMembers },
    { url: '/list', func: project.listProjects },
    { url: '/stat', func: project.statProjects },
    { url: '/tree', func: treeProject },
    { url: '/tree/search', func: treePathSearchProject }
];

controllers.forEach((config) => {
    router.post(config.url, asyncHandler(async (req, res) => {
        res.json(await config.func(req.body));
    }));
});

export default router;
