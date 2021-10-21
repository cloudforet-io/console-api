import faker from 'faker';
import { BaseFactory } from '@factories';

export class PhdCountByTypeFactory extends BaseFactory {
    private issue: any;
    private scheduledChange: any;
    private accountNotification: any;

    constructor() {
        super();
        this.issue = faker.random.number(20);
        this.scheduledChange = faker.random.number(20);
        this.accountNotification = faker.random.number(20);
    }
}
