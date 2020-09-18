import faker from 'faker';
import { BaseFactory } from '@factories/index';

export class PowerSchedulerResourceGroupsFactory extends BaseFactory {
    constructor(resourceGroups) {
        super();
        this.resource_groups = {};
        resourceGroups.forEach((resource_group_id) => {
            this.resource_groups[resource_group_id] = {
                name: faker.random.word(),
                count: faker.random.number({ min: 1, max: 100})
            };
        });
    }
}
