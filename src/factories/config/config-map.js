import faker from 'faker';
import { BaseFactory } from '@factories/index';

export class ConfigMapFactory extends BaseFactory {
    constructor(fields = {}) {
        super();
        this.name = fields.name || faker.random.word();
        this.data = fields.data || {
            [faker.random.word()]: faker.random.words(),
            [faker.random.word()]: faker.random.words(),
            [faker.random.word()]: faker.random.words()
        };
        this.tags = fields.tags || {
            [faker.random.word()]: faker.random.word(),
            [faker.random.word()]: faker.random.word()
        };
        this.domain_id = fields.domain_id || `domain-${faker.random.uuid().substr(0,8)}`;
    }
}
