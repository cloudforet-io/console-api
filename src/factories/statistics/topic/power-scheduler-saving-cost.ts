//@ts-nocheck
import faker from 'faker';
import { BaseFactory } from '@factories/index';

class PowerSchedulerSavingCostByProjectFactory extends BaseFactory {
    constructor(fields = {}) {
        super();
        this.saving_cost = faker.random.number(10000);
    }
}

export class PowerSchedulerSavingCostFactory extends BaseFactory {
    constructor(projects) {
        super();
        this.projects = {};
        projects.forEach((project_id) => {
            this.projects[project_id] = new PowerSchedulerSavingCostByProjectFactory();
        });
    }
}
