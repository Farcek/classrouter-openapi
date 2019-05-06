import { ReflectTypes, decoratorFactoryMethod, ReflectTypemeta, decoratorFactoryArgumentAndProperty, DecoratorType, decoratorFactoryMethodAndClass } from "@napp/reflect";



export namespace OpenAPIDecorator {

    export const $attrKey = {
        response: Symbol.for('attr.key.response'),
        param: Symbol.for('param'),
        security: Symbol.for('security'),
    };

    export interface OpenAPiResponse {
        ref: ReflectTypemeta,
        description?: string,
        status?: number,
        mediaType?: string
    }

    export interface OParam {
        description?: string;
        type?: { ref: ReflectTypes, isArray?: boolean }
        required?: boolean
        deprecated?: boolean
        allowEmptyValue?: boolean
    }

    export function Response(type: { ref: ReflectTypes, isArray?: boolean }, option?: { description?: string, status?: number, mediaType?: string }) {
        return decoratorFactoryMethod<OpenAPiResponse>(() => {
            return {
                ref: ReflectTypemeta.Factory(type.ref, type.isArray || false),
                description: option && option.description,
                status: option && option.status,
                mediaType: option && option.mediaType,
            }
        }, $attrKey.response);
    }

    export function Security(name: string) {
        return decoratorFactoryMethodAndClass<string>(() => {
            return name;
        }, $attrKey.security);
    }

    export function Param(option: OParam) {
        return decoratorFactoryArgumentAndProperty<OParam>(() => option, $attrKey.param);
    }
}

