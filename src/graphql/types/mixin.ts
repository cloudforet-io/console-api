import {ClassType, Field, ObjectType, InputType} from "type-graphql";

export default function withId<TClassType extends ClassType>(BaseClass: TClassType) {
    @ObjectType({ isAbstract: true })
    @InputType({ isAbstract: true })
    class IDTrait extends BaseClass {
        @Field()
        id!: string;
    }
    return IDTrait;
}
