import { ArgsType, Field } from "type-graphql";
import httpContext from "express-http-context";

@ArgsType()
export class DomainIDArgs {
    @Field({name:'domainId',nullable:true})
    domain_id: string;

}

export const getDomainId = (ctx:any, id:string)=>{
    return id || ctx.domain_id
}
