import config from 'config';
import redis from 'redis';

class RedisClient {
    async connect() {
        if (!this.client) {
            return new Promise((resolve, reject) => {
                try {
                    let client = redis.createClient(config.get('redis'));

                    client.on('error', (err) => {
                        reject(err);
                    });

                    client.on('connect', ()=> {
                        this.client = client;
                        resolve(this);
                    });
                } catch (e) {
                    reject(e);
                }
            });
        } else {
            return this;
        }
    }

    async set(key, value, expire) {
        if (expire) {
            await this.client.set(key, value, 'EX', expire);
        } else {
            await this.client.set(key, value);
        }
    }

    async get(key) {
        return new Promise((resolve, reject) => {
            this.client.get(key, (err, reply) => {
                try {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(reply);
                    }
                } catch (e) {
                    reject(e);
                }
            });
        });
    }

    async keys(pattern) {
        return new Promise((resolve, reject) => {
            this.client.keys(pattern, (err, replies) => {
                try {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(replies);
                    }
                } catch (e) {
                    reject(e);
                }
            });
        });
    }

    async ttl(key) {
        return new Promise((resolve, reject) => {
            this.client.ttl(key, (err, reply) => {
                try {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(reply);
                    }
                } catch (e) {
                    reject(e);
                }
            });
        });
    }

    async delete(key) {
        await this.client.del(key);
    }

    async deletePattern(pattern) {
        let keys = await this.keys(pattern);

        keys.map(async (key) => {
            await this.delete(key);
        });
    }

    async flush() {
        await this.client.flushdb();
    }
}

export default new RedisClient();

