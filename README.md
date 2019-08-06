# Steamug's WCB (Web-Console Backend) 

Steamug's WCB - https://git.pyengine.net/cloudone/wconsole-server. 
This project consists of Node'js backend, which implements following features .... 


If you use Steamugs product for your cloud management system, you might find some of these components useful!

[View the complete list of available components](https://git.pyengine.net/)


### other available components in Steamugs: 


- [Cloud One api](https://git.pyengine.net/cloudone/api)
- [Cloud One Web-console client](https://git.pyengine.net/cloudone/wconsole-client)
- [Cloud One lambda-function](https://git.pyengine.net/cloudone/lambda_fuctions)

##### WCB will use Node.js + express instead of other framework, for improved performance across all browsers and devices.

### Instructions of Usage 
#### Step 1 : 

- Fork or clone this repo. 
- Install nodejs and NPM
- Go to the project's root folder from your terminal and run `npm install`
- Run `npm run temp` on your local machine.
- Going to [http://localhost:3000](http://localhost:3000/api/check) will render an empty dashboard with message.
  
  You are ready to use this WCB as backend if you see this message on your browser.
 

```html
{"system_status":"UP"}
```
 

#### Step 2:

- Please, update package.json as your reference such as  

change this from 

```html
  "scripts": {
    "start": "npm run server:prod",
    "dev": "babel-node ./src/bin/www",
    "clean": "rimraf dist",
    "build": "babel ./src --out-dir dist",
    "server": "node ./dist/bin/www",
    "start:dev": "NODE_ENV=development npm-run-all server",
    "start:stg": "NODE_ENV=staging     npm-run-all server",
    "start:prod": "NODE_ENV=production npm-run-all server",
    "local": "NODE_ENV=local npm-run-all dev",
    "temp": "NODE_ENV=temp nodemon --exec babel-node ./src/app-bak.js.js",
    "test": "NODE_ENV=temp mocha --require @babel/register ./src/test/index.js"
  },
```

to 

```html
  "scripts": {
    "start": "npm run server:prod",
    "dev": "babel-node ./src/bin/www",
    "clean": "rimraf dist",
    "build": "babel ./src --out-dir dist",
    "server": "node ./dist/bin/www",
    "start:dev": "NODE_ENV=development npm-run-all server",
    "start:stg": "NODE_ENV=staging     npm-run-all server",
    "start:prod": "NODE_ENV=production npm-run-all server",
  },
```
for your preference. 
Then you can run `npm run` with script above. 

This is still a work in progress and will get better over time. 

##### If you have any further queries that you may have on please contact: `mzc_tnc_com_cloudone@megazone.com`
