import commonService from '@/service/Common/commonService';
import apiKeyService from '@/service/Identity/apiKeyService';
import domainService from '@/service/Identity/domainService';
import projectService from '@/service/Identity/projectService';
import userService from '@/service/Identity/userService';
import authService from '@/service/Auth/authService';
// eslint-disable-next-line import/no-unresolved
import dataService from '@/service/Inventory/dataCenterService';
import networkService from '@/service/Inventory/networkService';
import serverService from '@/service/Inventory/serverService';
import settingService from '@/service/Inventory/settingService';
import pluginService from '@/service/Plugin/pluginService';
import pluginManagerService from '@/service/Plugin/pluginManagerService';

export {
  authService,
  commonService,
  apiKeyService,
  domainService,
  projectService,
  userService,
  dataService,
  networkService,
  serverService,
  settingService,
  pluginService,
  pluginManagerService,
};
