import { cloneDeep, findIndex } from 'lodash';
import httpContext from 'express-http-context';

import menuConfig from '@controllers/add-ons/menu/config.json';
import { Menu } from '@controllers/add-ons/menu/type';
import { listRoleBindings } from '@controllers/identity/role-binding';


const listMenu = async () => {
    const convertedMenuConfig: Menu[] = cloneDeep(menuConfig.menu);

    let isAdminUser = false;
    const userType = httpContext.get('user_type');
    const userId = httpContext.get('user_id');
    if (userType === 'DOMAIN_OWNER') {
        isAdminUser = true;
    } else {
        const { results } = await listRoleBindings({
            resource_type: 'identity.User',
            resource_id: userId
        });
        const hasDomainAdminRole = !!(results.find(d => d.role_info.name === 'Domain Admin'));
        if (hasDomainAdminRole) isAdminUser = true;
    }

    if (!isAdminUser) {
        const idx = findIndex(convertedMenuConfig, (d) => d.name === 'administration');
        if (idx > -1) convertedMenuConfig.splice(idx, 1);
    }

    return { menu: convertedMenuConfig };
};

export {
    listMenu
};
