export default {
  setCurrrentEnv(environments) {
    console.log(`Current environment : ${process.env.NODE_ENV}`);
    if (process.env.NODE_ENV === 'local') {
      environments.config({ path: './src/config/env/web_api_local.env' });
    } else if (process.env.NODE_ENV === 'development') {
      environments.config({ path: './src/config/env/web_api_dev.env' });
    } else if (process.env.NODE_ENV === 'staging') {
      environments.config({ path: './src/config/env/web_api_stg.env' });
    }
    //TODO THIS HAS TO BE UPDATE WHEN WE MOVE TO PROPER ENVIRONMENT!!
    /*else if (process.env.NODE_ENV === 'pre-prod') {
      environments.config({ path: './src/config/env/web_api_local.env' });
    } else {
      environments.config({ path: './src/config/env/web_api_local.env' });
    }*/
  },

  expressConnect(database) {
    const db = database.connection;
    db.on('error', console.error);
    db.once('open', () => {
      const date = new Date();
      console.log(`Connection to mongo database has established at : ${date.toLocaleString()}`);
    });
    database.connect(`mongodb://${process.env.DB_USER}:${process.env.DB_USER}@${process.env.DB_HOST}:27017/${process.env.DB_SERVICE}`, { useNewUrlParser: true });
  },
};
