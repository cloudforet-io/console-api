import Common from '@/models/Common/common';
import restController from '@/controllers/REST/restController';

export default {
  healthCheck: (req, res, next) => res.status(200).json({
    reponse: 'Selected action is alive',
  }),
};
