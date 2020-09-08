import casual from 'casual';

casual.define('generate_id', function() {
    return {
        email: casual.email,
        firstname: casual.first_name,
        lastname: casual.last_name,
        password: casual.password
    };
});

class ConfigMap {
    constructor() {
        this.name = casual.name;
        this.data = {
            [casual.word]: casual.text,
            [casual.word]: casual.text,
            [casual.word]: casual.text
        };
        this.tags = {
            [casual.word]: casual.word,
            [casual.word]: casual.word
        };
        this.domain_id = casual.text;
    }
}

export {
    ConfigMap
};
