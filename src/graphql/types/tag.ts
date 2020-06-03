import {ObjectType, Field} from "type-graphql";
import GraphQLJSON from "graphql-type-json";

@ObjectType({ isAbstract: true })
export default class TagGQLType {
    @Field(type => GraphQLJSON)
    tags: any;
}
