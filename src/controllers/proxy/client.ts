import config from 'config';
import grpcClient from '@lib/grpc-client';
import _ from 'lodash';


class Client {
    private clients: any=null;
    constructor() {
    }

    async initServices  (){
        if (!this.clients){
            this.clients = {}
            const endpoints = config.get('endpoints');
            Object.keys(endpoints).forEach((service)=>{
                this.clients[service] = {}
            });
            for (const service of Object.keys(endpoints)) {
                for (const ver of Object.keys(endpoints[service])) {
                    const client = await grpcClient.get(service,ver)
                    this.clients[service][ver] = client
                }
            }
            // remove annotation if you want get all service of resource name
            // const container = {}
            // for (const mt of  Object.keys(grpcClient.grpcMethods)){
            //     const paths = mt.split('.')
            //     if (paths.length < 5){
            //         console.log(paths);
            //         continue
            //     }
            //     const service = paths[2]
            //     const resource = paths[4].split('/')[0]
            //     if (!container[service]){
            //         container[service] = {}
            //     }
            //     container[service][resource]=resource
            // }
            // console.log('clients',container)
        }
    }
    get = (service:string,version: string,resource: string,method:string)=>{
        return  _.get(this.clients,[service,version,resource,method])
    }

}


export const proxyClient = new Client();
