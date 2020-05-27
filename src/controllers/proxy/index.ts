import {proxyClient} from "controllers/proxy/client";
import express from 'express';


export const proxyHandler = (getClient:any)=>(async (req: express.Request,res:express.Response)=>{
    const urls = req.url.split('/').slice(1)
    let result:any = null
    if (urls.length >= 3){
        await proxyClient.initServices();
        const client = getClient(urls)
        if (client){
            result = await client(req.body)
        }
    }
    if (result){
        res.json(result)
    } else {
        res.status(404).send('can not find method')
    }
});
