import faker from 'faker';

import { BaseFactory } from '@factories';

export class UserConfigFactory extends BaseFactory {
    static buildBatch() {
        throw new Error('Method not implemented.');
    }
    private name: string;
    private data: object;
    private tags: object;
    private domain_id: string;
    constructor(fields = {
        data: undefined, name: undefined, tags: undefined, domain_id: ''
    }) {
        super();
        this.name = fields.name || faker.random.word();
        this.data = fields.data || {
            [faker.random.word()]: faker.random.words(),
            [faker.random.word()]: faker.random.words(),
            [faker.random.word()]: faker.random.words()
        };
        this.tags = fields.tags || {
            [faker.random.word()]: faker.random.words(),
            [faker.random.word()]: faker.random.words()
        };
        this.domain_id = fields.domain_id || `domain-${faker.random.uuid().substr(0,8)}`;
    }
}
