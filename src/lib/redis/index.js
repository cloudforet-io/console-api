import config from 'config';
import redis from 'redis';

class RedisClient {
    async get() {
        if (this.client) {
            return this.client;
        } else {
            return new Promise((resolve, reject) => {
                try {
                    let client = redis.createClient(config.get('redis'));

                    client.on('error', (err) => {
                        reject(err);
                    });

                    client.on('connect', ()=> {
                        this.client = client;
                        resolve(client);
                    });
                } catch (e) {
                    reject(e);
                }
            });
        }
    }
};

export default new RedisClient();

