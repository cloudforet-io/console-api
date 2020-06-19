import {ObjectType, Field, Int, ID, registerEnumType, FieldResolver, Root, InputType} from 'type-graphql';
import TagGQLType from "@/graphql/types/tag";
import withId from './mixin';
import PaginatedResponse from "graphql/types/pagenation";
import {makeMutationResult, MutationResponse} from "graphql/types/error";
import GraphQLJSON from "graphql-type-json";

export enum DomainState {
    NONE = "NONE",
    ENABLED = "ENABLED",
    DISABLED = "DISABLED",
}

registerEnumType(DomainState, {
    name: "DomainState",
    description: "Identity Domain State",
});



@ObjectType()
export class Domain extends withId(TagGQLType){
    @Field(() => ID)
    domain_id: string;

    @Field()
    name: string;

    @Field(type=>DomainState)
    state: DomainState;
}

@InputType()
export class DomainInput{
    @Field()
    name: string;

    @Field(type => GraphQLJSON)
    tags: any;

}

@ObjectType()
export class DomainConnection extends PaginatedResponse(Domain){
}

@ObjectType()
export class DomainMutationResult extends MutationResponse(Domain){

}


@ObjectType()
export class ServiceAccount extends withId(TagGQLType){
    @Field(() => ID)
    domain_id: string;

    @Field()
    name: string;

    @Field(type=>DomainState)
    state: DomainState;
}

@InputType()
export class ServiceAccountInput{
    @Field()
    name: string;

    @Field(type => GraphQLJSON)
    tags: any;

}

@ObjectType()
export class ServiceAccountConnection extends PaginatedResponse(ServiceAccount){
}

@ObjectType()
export class ServiceAccountMutationResult extends MutationResponse(ServiceAccount){

}
