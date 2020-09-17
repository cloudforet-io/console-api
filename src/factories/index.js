export class BaseFactory {
    static buildBatch(count, fields) {
        return [...Array(count).keys()].map(() => {
            return new this(fields);
        });
    }
}
