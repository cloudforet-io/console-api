// copy from https://github.com/MichalLytek/type-graphql/issues/133#issuecomment-495881876
import { Type } from "class-transformer";
import { ValidateNested } from "class-validator";
import { ClassType, Field } from "type-graphql";
import {
    AdvancedOptions,
    MethodAndPropDecorator
} from "type-graphql/dist/decorators/types";

export type ReturnTypeFunc = (returns?: undefined) => Function | ClassType;

export function NestedField(
    returnTypeFunction?: ReturnTypeFunc,
    options?: AdvancedOptions
): MethodAndPropDecorator;
export function NestedField(
    returnTypeFunction: ReturnTypeFunc,
    options?: AdvancedOptions
): MethodDecorator | PropertyDecorator {
    const fieldFn = Field(returnTypeFunction, options);
    const typeFn = Type(returnTypeFunction);
    const validateNestedFn = ValidateNested();

    return (target, propertyKey, descriptor) => {
        fieldFn(target, propertyKey, descriptor);
        typeFn(target, propertyKey as string);
        validateNestedFn(target, propertyKey as string);
    };
}
