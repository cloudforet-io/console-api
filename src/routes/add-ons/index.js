import express from 'express';
import config from 'config';
import file from './file';
import AddOn from '@lib/add-on';

const addOnList = config.get('addOns');

const router = express.Router();
router.use('/file', file);
addOnList.map(async(addOn)=>{
    const routeSingle = await AddOn[addOn.call_back](addOn.name);
    router.use(`/${addOn.name}`, routeSingle);
});

export default router;
