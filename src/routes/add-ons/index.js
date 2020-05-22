import express from 'express';
import config from 'config';
import file from './file';
import AddOn from '@lib/add-on';
import _ from 'lodash';
const addOnList = config.get('addOns');

const router = express.Router();
router.use('/file', file);
addOnList.map(async(addOn)=>{
    const routeSingle = await AddOn[addOn.route](addOn.name);
    if(!_.isEmpty(routeSingle)) router.use(`/${addOn.name}`, routeSingle);
});

module.exports = router;
