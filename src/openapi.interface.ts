export namespace OpenAPI {
    export interface IInfo {
        title: string;
        version: string;
        description?: string;
        termsOfService?: string;
        contact?: {
            name?: string;
            url?: string;
            email?: string;
        }
        license?: {
            name: string;
            url: string;
        }
    }
    export interface IServerObject {
        url: string;
        description?: string;
        variables?: { [key: string]: { default: string, description?: string, enum?: string[] } }
    }
    export interface IReferenceObject {
        $ref: string
    }
    export interface ISchemaPrimary {
        type: string;
        format?: string;

    }
    export interface ISchemaComplex {
        type: 'object' | 'array';
        description?: string;
        required?: string[];
        items?: { [name: string]: IReferenceObject | ISchemaPrimary | ISchemaComplex };
        properties?: { [name: string]: IReferenceObject | ISchemaPrimary | ISchemaComplex };
        example?: any;
    }
    export interface IParameterObject {
        in: "query" | "header" | "path" | "cookie";
        name: string;
        schema?: ISchemaPrimary | ISchemaComplex | IReferenceObject;
        description?: string;
        required?: boolean;
        deprecated?: boolean;
        allowEmptyValue?: boolean;

    }
    export interface IRequestBodyObject {
        description: string;
        content: { [mediatype: string]: IMediaTypeObject };
        required?: boolean;
    }
    export interface IOperationObject {
        tags?: string[]
        summary?: string;
        description?: string;


        parameters?: (IParameterObject | IReferenceObject)[];
        requestBody?: IRequestBodyObject | IReferenceObject;
        responses: IResponsesObject;
        operationId: string;

        security: { [key: string]: string[] }[];
    }
    export interface IPathItemObject {
        description?: string;
        summary?: string;
        get?: IOperationObject;
        put?: IOperationObject;
        post?: IOperationObject;
        delete?: IOperationObject;
        head?: IOperationObject;

    }
    export interface IPathsObject {
        [path: string]: IPathItemObject;
    }
    export interface IMediaTypeObject {
        schema: ISchemaPrimary | ISchemaComplex | IReferenceObject;
        example?: any;
    }
    export interface IHeaderObject {
        description: string,
        schema: ISchemaPrimary
    }
    export interface IResponseObject {
        description: string;
        content: { [type: string]: IMediaTypeObject }
        headers?: { [name: string]: IHeaderObject }
    }
    export interface IResponsesObject {
        default: IResponseObject | IReferenceObject;
        [statusCode: string]: IResponseObject | IReferenceObject;
    }
    export interface IComponents {
        schemas: { [name: string]: ISchemaPrimary | ISchemaComplex | IReferenceObject };
        // responses?:IResponsesObject;
        // parameters:
        // examples:
        // requestBodies:
        // headers:
        securitySchemes: {
            [name: string]: any
        }
    }
    export interface ISecurityRequirementObject {
        [name: string]: string[];

    }
    export interface ISecuritySchemeObject {
        type: "apiKey" | "http" | "oauth2" | "openIdConnect";
        description?: string;
        /**
         * type = apiKey
         * requered
         */
        name?: string;

        /**
         * type = apiKey
         * requered
         */
        in?: 'query' | 'header' | 'cookie'

        /**
         * type = http
         * requered
         */
        scheme?: string
    }
    export interface ITag {
        name: string;
        description?: string;
    }
    export interface IRoot {
        openapi: string;
        info: IInfo;

        servers: IServerObject[];

        paths: IPathsObject;

        components: IComponents;
        security: ISecurityRequirementObject[];
        tags: ITag[];

    }
}
