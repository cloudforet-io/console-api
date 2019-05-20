import express from 'express';
import projectService from '@/service/Project/projectService';

const projectRouter = express.Router();

projectRouter.use('/', projectService);

export default projectRouter;
