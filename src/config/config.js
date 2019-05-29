export default {
  secretKey: 'thisIsCloudOneSecretControlKey',
  setCurrrentEnv(environments) {
    console.log(`Current environment : ${process.env.NODE_ENV}`);
    // TODO Tenmp environment is only temporarily; Please remove this when all environment is settled.
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
            fileSystem.readFile(packageJsonFile, (err, data) => {
              if (err) {
                console.log(err);
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
};
