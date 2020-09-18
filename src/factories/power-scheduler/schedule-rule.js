import faker from 'faker';
import moment from 'moment';
import { BaseFactory } from '@factories/index';

export class ScheduleRuleFactory extends BaseFactory {
    constructor(fields = {}) {
        super();
        this.schedule_rule_id = fields.schedule_rule_id || `sr-${faker.random.uuid().substr(0,8)}`;
        this.name = fields.name || faker.random.word();
        this.rule_type = fields.rule_type || faker.random.arrayElement(['ROUTINE', 'TICKET']);
        if (this.rule_type == 'ROUTINE') {
            this.state = 'RUNNING';
            this.rule = fields.rule || {
                MON: faker.random.arrayElements(Array.from(Array(23).keys())),
                TUE: faker.random.arrayElements(Array.from(Array(23).keys())),
                WED: faker.random.arrayElements(Array.from(Array(23).keys())),
                THU: faker.random.arrayElements(Array.from(Array(23).keys())),
                FRI: faker.random.arrayElements(Array.from(Array(23).keys())),
                SAT: faker.random.arrayElements(Array.from(Array(23).keys())),
                SUN: faker.random.arrayElements(Array.from(Array(23).keys()))
            };
        } else {
            this.state = fields.state || faker.random.arrayElement(['RUNNING', 'STOPPED']);
            this.rule = fields.rule || {
                [moment().add('days', faker.random.number({ min: -7, max: 7 })).format('YYYY-MM-DD')]: faker.random.arrayElements(Array.from(Array(23).keys())),
                [moment().add('days', faker.random.number({ min: -7, max: 7 })).format('YYYY-MM-DD')]: faker.random.arrayElements(Array.from(Array(23).keys())),
                [moment().add('days', faker.random.number({ min: -7, max: 7 })).format('YYYY-MM-DD')]: faker.random.arrayElements(Array.from(Array(23).keys())),
                [moment().add('days', faker.random.number({ min: -7, max: 7 })).format('YYYY-MM-DD')]: faker.random.arrayElements(Array.from(Array(23).keys())),
                [moment().add('days', faker.random.number({ min: -7, max: 7 })).format('YYYY-MM-DD')]: faker.random.arrayElements(Array.from(Array(23).keys())),
            };
        }

        this.timezone = fields.timezone || faker.random.arrayElement(['UTC', 'Asia/Seoul']);
        this.tags = fields.tags || {
            [faker.random.word()]: faker.random.word(),
            [faker.random.word()]: faker.random.word()
        };
        this.project_id = `project-${faker.random.uuid().substr(0,8)}`;
        this.domain_id = fields.domain_id || `domain-${faker.random.uuid().substr(0,8)}`;
        this.created_by = faker.name.lastName();
        this.created_at = {
            seconds: parseInt(faker.time.recent() / 1000)
        };
    }
}
