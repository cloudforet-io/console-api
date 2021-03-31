//@ts-nocheck
import faker from 'faker';
import { BaseFactory } from '@factories/index';

class PowerSchedulerResourceByProjectFactory extends BaseFactory {
    constructor(fields = {}) {
        super();
        this.managed_count = faker.random.number({ min: 0, max: 30 });
        this.total_count = faker.random.number({ min: 30, max: 50 });
    }
}

export class PowerSchedulerResourcesFactory extends BaseFactory {
    constructor(projects) {
        super();
        this.projects = {};
        projects.forEach((project_id) => {
            this.projects[project_id] = new PowerSchedulerResourceByProjectFactory();
        });
    }
}
