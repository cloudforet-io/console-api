import faker from 'faker';
import { BaseFactory } from '@factories/index';

class PowerSchedulerSchedulesByProjectFactory extends BaseFactory {
    constructor(fields = {}) {
        super();
        this.schedule_id = fields.schedule_id || `domain-${faker.random.uuid().substr(0,8)}`;
        this.name = fields.name || faker.random.word();
        this.rule = fields.rule || {
            MON: faker.random.arrayElements(Array.from(Array(23).keys())),
            TUE: faker.random.arrayElements(Array.from(Array(23).keys())),
            WED: faker.random.arrayElements(Array.from(Array(23).keys())),
            THU: faker.random.arrayElements(Array.from(Array(23).keys())),
            FRI: faker.random.arrayElements(Array.from(Array(23).keys())),
            SAT: faker.random.arrayElements(Array.from(Array(23).keys())),
            SUN: faker.random.arrayElements(Array.from(Array(23).keys()))
        };
    }
}

export class PowerSchedulerSchedulesFactory extends BaseFactory {
    constructor(projects) {
        super();
        this.projects = {};
        projects.forEach((project_id) => {
            const count = faker.random.number(3);
            this.projects[project_id] = PowerSchedulerSchedulesByProjectFactory.buildBatch(count);
        });
    }
}
