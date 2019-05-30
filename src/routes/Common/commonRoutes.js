import express from 'express';

const commonRouter = express.Router();

// create User
commonRouter.get('/', (req, res) => res.status(200).json({
  msg: 'check condition is on proper ',
}));

export default commonRouter;
