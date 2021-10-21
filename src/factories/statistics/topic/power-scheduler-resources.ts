import faker from 'faker';
import { BaseFactory } from '@factories';

class PowerSchedulerResourceByProjectFactory extends BaseFactory {
    private managed_count: any;
    private total_count: any;
    constructor() {
        super();
        this.managed_count = faker.random.number({ min: 0, max: 30 });
        this.total_count = faker.random.number({ min: 30, max: 50 });
    }
}

export class PowerSchedulerResourcesFactory extends BaseFactory {
    private projects: {};
    constructor(projects) {
        super();
        this.projects = {};
        projects.forEach((project_id) => {
            this.projects[project_id] = new PowerSchedulerResourceByProjectFactory();
        });
    }
}
