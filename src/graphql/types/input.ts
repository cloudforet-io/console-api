import {Field, InputType, Int, createUnionType, ObjectType} from "type-graphql";
import { Type } from "class-transformer";
import { NestedField } from "./nested";


//
// @InputType()
// class QueryFilterSingleItem {
//     @Field()
//     key:string;
//
//     @Field()
//     operator:string;
//
//     @Field()
//     value:string;
// }

// @InputType()
// class QueryFilterMultiItem {
//     @Field()
//     key:string;
//
//     @Field()
//     operator:string;
//
//     @Field(()=>[String])
//     value:string[];
// }
// export const QueryFilter = createUnionType({
//     name: "QueryFilter", // the name of the GraphQL union
//     types: () => [QueryFilterSingleItem, QueryFilterMultiItem] as const, // function that returns tuple of object types classes
// });

@InputType()
class QueryFilterItem {
    @Field()
    key:string;

    @Field()
    operator:string;

    @Field(()=>[String])
    value:string[];
}

@InputType()
class QueryPage {
    @Field(type=>Int,{nullable:true,defaultValue:1})
    start:number

    @Field(type=>Int,{nullable:true})
    limit:number
}

@InputType()
class QuerySort {
    @Field()
    key:string;

    @Field(type=>Boolean,{nullable:true})
    desc:Boolean
}


export interface QueryFilterType {
    key:string
    operator:string
    value:string[]
}

@InputType({description:"SpaceOne list query spec"})
export class QueryInput {
    @Field(returns=>[QueryFilterItem],{nullable:true})
    @Type(()=>QueryFilterItem)
    filter: QueryFilterType[]

    @Field(returns=>[QueryFilterItem],{name:'filterOr',nullable:true})
    @Type(()=>QueryFilterItem)
    filter_or: QueryFilterType[]

    @Field(()=>[String],{nullable:true})
    only: string[]

    @Field({nullable:true})
    keyword: string

    @Field(()=>Boolean,{nullable:true,name:'countOnly'})
    count_only: Boolean

    // @Field(type=>QueryPage,{nullable:true})
    // @Type(()=>QueryPage)
    @NestedField((type)=>QueryPage,{nullable:true})
    page:QueryPage

    // @Field(type=>QuerySort,{nullable:true})
    // @Type(()=>QueryPage)
    @NestedField((type)=>QuerySort,{nullable:true})
    sort:QuerySort
}
