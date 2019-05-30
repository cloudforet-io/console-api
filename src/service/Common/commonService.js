import Common from '@/models/Common/common';
import restController from '@/controllers/REST/restController';

export default {
  healthCheck: (req, res, next) => {
    res.json({ system_status: 'UP'});
  }
};
