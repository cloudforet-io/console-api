import express from 'express';
import asyncHandler from 'express-async-handler';
import { getAutocomplete } from '@/add-ons/autocomplete/controller';

const router = express.Router();
router.post('/get', asyncHandler(async (req, res, next) => {
    res.json(await getAutocomplete(req.body));
}));

module.exports = router;
