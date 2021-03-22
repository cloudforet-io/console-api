import faker from 'faker';
// @ts-ignore
import { BaseFactory } from '@factories/index';

export class UserConfigFactory extends BaseFactory {
    constructor(fields = {}) {
        super();
        this.name = fields.name || faker.random.word();
        this.data = fields.data || {
            [faker.random.word()]: faker.random.words(),
            [faker.random.word()]: faker.random.words(),
            [faker.random.word()]: faker.random.words()
        };
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
        this.domain_id = fields.domain_id || `domain-${faker.random.uuid().substr(0,8)}`;
    }
}
