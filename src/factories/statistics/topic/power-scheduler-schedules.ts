import faker from 'faker';

import { BaseFactory } from '@factories/index';

class PowerSchedulerSchedulesByProjectFactory extends BaseFactory {
    private schedule_id: any;
    private name: any;
    private desired_state: any;
    private rule: { times: any; day: string } [];

    constructor(fields: any = {}) {
        super();
        this.schedule_id = fields.schedule_id || `domain-${faker.random.uuid().substr(0,8)}`;
        this.name = fields.name || faker.random.word();
        this.desired_state = fields.desired_state || faker.random.arrayElement(['ON', 'OFF']);
        this.rule = fields.rule || [
            {
                day: 'mon',
                times: faker.random.arrayElements(Array.from(Array(23).keys()))
            },
            {
                day: 'tue',
                times: faker.random.arrayElements(Array.from(Array(23).keys()))
            },
            {
                day: 'wed',
                times: faker.random.arrayElements(Array.from(Array(23).keys()))
            },
            {
                day: 'thu',
                times: faker.random.arrayElements(Array.from(Array(23).keys()))
            },
            {
                day: 'fri',
                times: faker.random.arrayElements(Array.from(Array(23).keys()))
            },
            {
                day: 'sat',
                times: faker.random.arrayElements(Array.from(Array(23).keys()))
            },
            {
                day: 'sun',
                times: faker.random.arrayElements(Array.from(Array(23).keys()))
            }
        ];
    }
}

export class PowerSchedulerSchedulesFactory extends BaseFactory {
    private projects: {};

    constructor(projects) {
        super();
        this.projects = {};
        projects.forEach((project_id) => {
            const count = faker.random.number(3);
            this.projects[project_id] = PowerSchedulerSchedulesByProjectFactory.buildBatch(count);
        });
    }
}
