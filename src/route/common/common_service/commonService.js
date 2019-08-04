import common from '/model/common/common';
import restController from '/controller/rest/rest_controller';
import config from '/config/config';
import user from '/model/identity/user';
import project from '/model/identity/project';
import projectGroup from '/model/identity/project_group';
import projectGroupMember from '/model/identity/project_group_member';

import dummy from 'mongoose-dummy';

export default {
  healthCheck: (req, res, next) => {
    res.json({ system_status: 'UP' });
  },
  randomDataGenerator: (req, res, next) => {
    /*
    * 1. Add a Model to create Random value at appopriate location.
    * 2. Add a Model into overObject down below.
    *
    * user: User
    * proj: Project
    * prgr: Project Group
    * prgm: Project Group Member
    *
    *
    */

    const overObject = {
      user: new user(),
      proj: new project(),
      prgr: new projectGroup(),
      prgm: new projectGroupMember(),
    };

    const key = req.body.key;
    if (overObject.hasOwnProperty(key)) {
      const dummySchemaData = dummy(overObject[key]);
      const dummySchema = overObject[key];
      for (const keyIterate in dummySchemaData) {
        dummySchema.set(keyIterate, dummySchemaData[keyIterate]);
      }

      restController.postSave(dummySchema, req, res, next);
    }
  },
};
