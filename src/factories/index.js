export class BaseFactory {
    static buildBatch(count, fields) {
        return {
            results: [...Array(count).keys()].map((idx) => {
                return new this(fields);
            }),
            total_count: count
        };
    }
}
