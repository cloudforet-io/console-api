import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import redis from 'redis';

export default {
  secretKey: 'thisIsCloudOneSecretControlKey',
  redisClient: redis.createClient({ port: process.env.REDIS_PORT, host: process.env.REDIS_HOST, password: process.env.REDIS_PASSWORD }),
  setRedisSession: {
  },
  setCurrrentEnv(environments) {
    /*
     * TODO Tenmp environment is only temporarily; Please remove this when all environment is settled.
     */
    if (process.env.NODE_ENV === 'temp') {
      environments.config({ path: './src/config/env/web_api_temp_test.env' });
    } else if (process.env.NODE_ENV === 'local') {
      environments.config({ path: './src/config/env/web_api_local.env' });
    } else if (process.env.NODE_ENV === 'development') {
      environments.config({ path: './src/config/env/web_api_dev.env' });
    } else if (process.env.NODE_ENV === 'staging') {
      environments.config({ path: './src/config/env/web_api_stg.env' });
    }
    // TODO THIS HAS TO BE UPDATE WHEN WE MOVE TO PROPER ENVIRONMENT!!
    /* else if (process.env.NODE_ENV === 'pre-prod') {
      environments.config({ path: './src/config/env/web_api_local.env' });
    } else {
      environments.config({ path: './src/config/env/web_api_local.env' });
    } */
  },
  connectListener(app) {
    if (process.env.NODE_ENV === 'temp' || process.env.NODE_ENV === 'local') app.listen(process.env.APP_PORT, () => { console.log(`Server is listening on port: ${process.env.APP_PORT}`); });
  },
  expressConnect(database) {
    const db = database.connection;
    let mongodb = 'mongodb://';
    db.on('error', console.error);
    db.once('open', () => {
      const date = new Date();
      console.log(`Connection to mongo database has established at : ${date.toLocaleString()}`);
    });
    const dbEnv = [':', process.env.DB_USER, ':', process.env.DB_PASS, '@', process.env.DB_HOST, ':', process.env.DB_PORT, '/', process.env.DB_SERVICE];
    // eslint-disable-next-line eqeqeq
    console.log('Current Envrionment: ', process.env.NODE_ENV);
    dbEnv.forEach((e, i) => { if (e && i != 0 && dbEnv[i - 1]) mongodb += e; });
    if (process.env.NODE_ENV != 'prod') console.log(`Database Connected to: ${mongodb}`);
    database.connect(mongodb, { useNewUrlParser: true });
  },
  corrOptionPreperation(whitelist, credential) {
    const consList = (whitelist.indexOf(',') !== -1) ? whitelist.split(',') : whitelist;
    console.log('Cons lists allowed => ', consList);
    const corsOptions = {
      credentials: credential,
      origin: (origin, callback) => {
        console.log('origin from => ', origin);
        if (consList.indexOf(origin) !== -1) {
          callback(null, true);
        } else {
          callback(new Error(`Not allowed by CORS with Requested URL: ${origin}`));
        }
      },
    };
    return corsOptions;
  },
  printImportedmodule(fileSystem) {
    fileSystem.readdir('./node_modules', (err, dirs) => {
      if (err) {
        console.log(err);
        return;
      }
      dirs.forEach((dir) => {
        if (dir.indexOf('.') !== 0) {
          const packageJsonFile = `./node_modules/${dir}/package.json`;
          if (fileSystem.existsSync(packageJsonFile)) {
            fileSystem.readFile(packageJsonFile, (error, data) => {
              if (error) {
                console.log(error);
              } else {
                const json = JSON.parse(data);
                console.log(`"${json.name}": "${json.version}",`);
              }
            });
          }
        }
      });
    });
  },
  swagger(type) {
    const swaggerDefinition = {
      info: {
        title: 'CloudOne API',
        version: '1.0.0',
        description: 'CloudOne API',
      },
    };
    const options = {
      swaggerDefinition,
      apis: ['/routes*.js', './example/parameters.yaml'],
    };
    if (type === 'serve') {
      return swaggerUi.serve;
    } if (type === 'setup') {
      return swaggerUi.setup(swaggerJSDoc(options));
    }
  },
};
