//@ts-nocheck
import faker from 'faker';
import moment from 'moment';
import { BaseFactory } from '@factories/index';

export class ScheduleRuleFactory extends BaseFactory {
    private schedule_rule_id: string;
    private name: string;
    private rule_type: string;
    private state: string;
    private rule: object[];

    constructor(fields: { rule_type: string; state: string }) {
        super();
        this.schedule_rule_id = fields.schedule_rule_id || `sr-${faker.random.uuid().substr(0,8)}`;
        this.name = fields.name || faker.random.word();
        this.rule_type = fields.rule_type || faker.random.arrayElement(['ROUTINE', 'TICKET']);
        if (this.rule_type == 'ROUTINE') {
            this.state = 'RUNNING';
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
                }
            ];
        } else {
            this.state = fields.state || faker.random.arrayElement(['RUNNING', 'STOPPED']);
            this.rule = fields.rule || [
                {
                    date: moment().add('days', faker.random.number({ min: -7, max: 7 })).format('YYYY-MM-DD'),
                    times: faker.random.arrayElements(Array.from(Array(23).keys()))
                },
                {
                    date: moment().add('days', faker.random.number({ min: -7, max: 7 })).format('YYYY-MM-DD'),
                    times: faker.random.arrayElements(Array.from(Array(23).keys()))
                },
                {
                    date: moment().add('days', faker.random.number({ min: -7, max: 7 })).format('YYYY-MM-DD'),
                    times: faker.random.arrayElements(Array.from(Array(23).keys()))
                },
                {
                    date: moment().add('days', faker.random.number({ min: -7, max: 7 })).format('YYYY-MM-DD'),
                    times: faker.random.arrayElements(Array.from(Array(23).keys()))
                },
                {
                    date: moment().add('days', faker.random.number({ min: -7, max: 7 })).format('YYYY-MM-DD'),
                    times: faker.random.arrayElements(Array.from(Array(23).keys()))
                }
            ];
        }

        this.tags = fields.tags || [
            {
                'key': faker.random.word(),
                'value': faker.random.word()
            },
            {
                'key': faker.random.word(),
                'value': faker.random.word()
            }
        ];
        this.project_id = `project-${faker.random.uuid().substr(0,8)}`;
        this.domain_id = fields.domain_id || `domain-${faker.random.uuid().substr(0,8)}`;
        this.created_by = faker.name.lastName();
        this.created_at = {
            seconds: parseInt(faker.time.recent() / 1000)
        };
    }
}
