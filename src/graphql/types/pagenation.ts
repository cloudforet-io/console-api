// copy from https://github.com/MichalLytek/type-graphql/blob/v1.0.0-rc.2/examples/generic-types/paginated-response.type.ts
import { ClassType, ObjectType, Field, Int } from "type-graphql";
import {ErrorType} from "graphql/types/error";

export default function PaginatedResponse<TItem>(TItemClass: ClassType<TItem>) {
    // `isAbstract` decorator option is mandatory to prevent registering in schema
    @ObjectType({ isAbstract: true })
    abstract class PaginatedResponseClass {
        @Field(type => [TItemClass])
        results: TItem[];

        @Field(type => Int,{name:'totalCount'})
        total_count: number;

        @Field(type => ErrorType,{nullable:true})
        error: ErrorType;
    }
    return PaginatedResponseClass;
}
