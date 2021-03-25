//@ts-nocheck
import faker from 'faker';
import { BaseFactory } from '@factories/index';

export class PhdCountByTypeFactory extends BaseFactory {
    constructor() {
        super();
        this.issue = faker.random.number(20);
        this.scheduledChange = faker.random.number(20);
        this.accountNotification = faker.random.number(20);
    }
}
