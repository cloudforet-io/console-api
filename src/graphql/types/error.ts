import {ClassType, Field, ID, Int, Mutation, ObjectType} from "type-graphql";
import withId from "graphql/types/mixin";


@ObjectType()
export class ErrorType {
    @Field()
    message: string;
    @Field()
    code: string;
}

export const convertErrorMessage = (e:any) =>{
    return {error : {code:e.error_code,message:e.details}}
}

export const makeMutationResult = (klass,name:string)=>{
    @ObjectType(name)
    class MutationResult extends MutationResponse(klass){
    }
    return MutationResult
}


export const MutationResponse = <TItem>(TItemClass: ClassType<TItem>)=> {
    @ObjectType({ isAbstract: true })
    abstract class MutationClass {
        @Field(type => TItemClass,{nullable:true})
        result: TItem;

        @Field(type => ErrorType,{nullable:true})
        error: ErrorType;

    }
    return MutationClass;
}

