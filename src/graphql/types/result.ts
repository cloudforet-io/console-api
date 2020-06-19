import {Field, ObjectType} from "type-graphql";
import {ErrorType} from "./error";

@ObjectType()
abstract class DeleteMutationResult {

    @Field(type => ErrorType,{nullable:true})
    error: ErrorType;

}
