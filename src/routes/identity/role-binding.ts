import express from 'express';
import asyncHandler from 'express-async-handler';
import * as roleBinding from '@controllers/identity/role-binding';

const router = express.Router();

const controllers = [
    { url: '/create', func: roleBinding.createRoleBinding },
    { url: '/update', func: roleBinding.updateRoleBinding },
    { url: '/delete', func: roleBinding.deleteRoleBinding },
    { url: '/get', func: roleBinding.getRoleBinding },
    { url: '/list', func: roleBinding.listRoleBindings },
    { url: '/stat', func: roleBinding.statRoleBindings }
];

controllers.forEach((config) => {
    router.post(config.url, asyncHandler(async (req, res) => {
        res.json(await config.func(req.body));
    }));
});

export default router;
