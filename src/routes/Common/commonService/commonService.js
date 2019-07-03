import Common from '@/models/Common/common';
import restController from '@/controllers/REST/restController';
import config from '@/config/config';
import User from '@/models/Identity/user';
import Project from '@/models/Identity/project';
import ProjectGroup from '@/models/Identity/projectGroup';
import ProjectGroupMember from '@/models/Identity/projectGroupMember';

import dummy from 'mongoose-dummy';

export default {
  healthCheck: (req, res, next) => {
    res.json({ system_status: 'UP' });
  },
  randomDataGenerator: (req, res, next) => {
    /*
    * user: User
    * proj: Project
    * prgr: Project Group
    * prgm: Project Group Member
    */

    const overObject = {
      user: new User(),
      proj: new Project(),
      prgr: new ProjectGroup(),
      prgm: new ProjectGroupMember(),
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
