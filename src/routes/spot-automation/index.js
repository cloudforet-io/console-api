import express from 'express';
import controllerRouter from './controller';
import domainRouter from './domain';
import jobRouter from './job';
import spotGroupRouter from './spot-group';

const router = express.Router();

router.use('/controller', controllerRouter);
router.use('/domain', domainRouter);
router.use('/job', jobRouter);
router.use('/spot-group', spotGroupRouter);

export default router;
