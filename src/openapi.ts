import { Classtype, Rootmeta, ControllerMeta, ActionClassMeta, ActionMethodMeta, PropertyParamMeta, ArgumentParamMeta, MethodMeta, HttpMethod, Paramtype, ClassrouterFactory } from "classrouter";
import { ReflectType, ReflectTypemeta, ReflectClassmeta } from "@napp/reflect";
import { OpenAPI } from "./openapi.interface";

import { parse as UriTokenParser } from "path-to-regexp";
import { OpenAPIDecorator } from "./decoders";

interface IParentData {
    secureName?: string
}

export class ClassrouterOpenAPI {

    apiJson: OpenAPI.IRoot = {
        openapi: "3.0.0",
        info: {
            version: "1.0.1",
            title: "Api Service"
        } as OpenAPI.IInfo,
        servers: [] as OpenAPI.IServerObject[],
        paths: {} as OpenAPI.IPathsObject,
        components: {
            schemas: {
                __void: {
                    type: "object",
                    description: 'the type is void'
                }
            },
            securitySchemes: {

            }
        } as OpenAPI.IComponents,
        security: [] as OpenAPI.ISecurityRequirementObject[],
        tags: [] as OpenAPI.ITag[],
    }

    constructor(private calssrouter: ClassrouterFactory) {

    }

    setInfo(info: OpenAPI.IInfo) {
        this.apiJson.info = info;
        return this;
    }

    setServers(servers: OpenAPI.IServerObject[]) {
        this.apiJson.servers = servers;
        return this;
    }

    addSecurity(name: string, type: 'bearer' | 'basic') {
        this.apiJson.components.securitySchemes[name] = {
            type: "http",
            scheme: "bearer"
        };
        return this;
    }


    build() {
        for (let n of (Object.keys(this.calssrouter.rootMetada.controllers))) {
            this.buildController(this.calssrouter.rootMetada.controllers[n], {});
        }
        return this;
    }

    cloneParent(parantData: IParentData) {
        return {
            secureName: parantData.secureName
        } as IParentData;
    }


    private buildController(c: ControllerMeta, parantData: IParentData) {
        let secureName = ReflectClassmeta.Resolve(c.Controllerclass).attrGetClass(OpenAPIDecorator.$attrKey.security);
        let childData = this.cloneParent(parantData);
        if (secureName) {
            childData.secureName = secureName;
        }

        for (let n of Object.keys(c.controllers)) {
            let m = c.controllers[n];
            this.buildController(m, childData);
        }

        for (let n of Object.keys(c.classActions)) {
            this.buildClassaction(c.classActions[n], childData);
        }
        for (let n of Object.keys(c.methodActions)) {
            this.buildMethodaction(c.methodActions[n], childData);
        }
    }

    buildResponse(refClass: Classtype, method: MethodMeta): OpenAPI.IResponsesObject {
        let retType = ReflectClassmeta.Resolve(refClass).methodGetReturn(method.methodname);
        let description = '';
        return {
            default: {
                description,
                content: {
                    "application/json": {
                        schema: this.type2schema(retType)
                    }
                },
                headers: {}
            }
        }
    }

    buildParam(paramtype: Paramtype, reqName: string[], typemeta: ReflectTypemeta): OpenAPI.IParameterObject | null {
        let location: "query" | "header" | "path" | "cookie" | null = null;
        if (paramtype == Paramtype.Query) {
            location = 'query';
        } else if (paramtype == Paramtype.Header) {
            location = 'header';
        } else if (paramtype == Paramtype.Path) {
            location = 'path';
        } else if (paramtype == Paramtype.Cookie) {
            location = 'cookie';
        }
        if (location) {
            return {
                in: location,
                name: reqName.join('|'),

                schema: this.type2schema(typemeta)
            }
        }
        return null;
    }


    buildRequestParams(refClass: Classtype, paramsMeta: PropertyParamMeta[], methodMeta: MethodMeta): (OpenAPI.IParameterObject | OpenAPI.IReferenceObject)[] {
        let ret: (OpenAPI.IParameterObject | OpenAPI.IReferenceObject)[] = [];
        let refMeta = ReflectClassmeta.Resolve(refClass);
        for (let p of paramsMeta) {

            let openApiPropertyMeta: OpenAPIDecorator.OParam = refMeta.attrGetProperty(OpenAPIDecorator.$attrKey.param, p.propertyName);

            let refType: ReflectTypemeta;
            if (openApiPropertyMeta && openApiPropertyMeta.type) {
                refType = ReflectTypemeta.Factory(openApiPropertyMeta.type.ref, openApiPropertyMeta.type.isArray || false);
            } else {
                refType = refMeta.propertyGetType(p.propertyName);
            }


            let pp = this.buildParam(p.paramtype, p.reqFieldnames, refType);
            if (pp) {
                if (openApiPropertyMeta && openApiPropertyMeta.description) {
                    pp.description = openApiPropertyMeta.description;
                } else {
                    pp.description = ReflectClassmeta.Resolve(refClass).propertyGetDescription(p.propertyName);
                }

                if (openApiPropertyMeta) {
                    pp.required = openApiPropertyMeta.required;
                    pp.deprecated = openApiPropertyMeta.deprecated;
                    pp.allowEmptyValue = openApiPropertyMeta.allowEmptyValue;
                }

                ret.push(pp);
            }
        }
        for (let a of methodMeta.argumentParams) {
            let refType: ReflectTypemeta;
            let openApiArgmeta: OpenAPIDecorator.OParam = refMeta.attrGetArguments(OpenAPIDecorator.$attrKey.param, methodMeta.methodname, a.argIndex);
            if (openApiArgmeta && openApiArgmeta.type) {
                refType = ReflectTypemeta.Factory(openApiArgmeta.type.ref, openApiArgmeta.type.isArray || false);
            } else {
                refType = refMeta.argumentGetType(methodMeta.methodname, a.argIndex);
            }

            //let refType = this.resloveArgumentReftype(refClass, methodMeta.methodname, a.argIndex)
            let pp = this.buildParam(a.paramtype, a.reqFieldnames, refType);
            if (pp) {
                if (openApiArgmeta && openApiArgmeta.description) {
                    pp.description = openApiArgmeta.description;
                } else {
                    pp.description = ReflectClassmeta.Resolve(refClass).argumentGetDescription(methodMeta.methodname, a.argIndex);
                }

                if (openApiArgmeta) {
                    pp.required = openApiArgmeta.required;
                    pp.deprecated = openApiArgmeta.deprecated;
                    pp.allowEmptyValue = openApiArgmeta.allowEmptyValue;
                }

                ret.push(pp);
            }
        }
        return ret;
    }

    buildRequestBodySchema(refClass: Classtype, paramsMeta: PropertyParamMeta[], methodMeta: MethodMeta) {
        let has = false;
        let bodySchema: OpenAPI.ISchemaComplex = {
            type: 'object',
            description: '',
            properties: {}
        }

        for (let p of paramsMeta) {
            if (p.paramtype == Paramtype.Body && bodySchema.properties) {
                let tyep = ReflectClassmeta.Resolve(refClass).propertyGetType(p.propertyName);
                if (p.reqFieldnames.length == 0) {
                    return {
                        has: true,
                        description: '',
                        schema: this.type2schema(tyep)
                    }
                } else {
                    let f = p.reqFieldnames[0];
                    bodySchema.properties[f] = this.type2schema(tyep);
                    has = true;
                }
            }

        }

        for (let p of methodMeta.argumentParams) {
            if (p.paramtype == Paramtype.Body && bodySchema.properties) {
                let tyep = ReflectClassmeta.Resolve(refClass).argumentGetType(methodMeta.methodname, p.argIndex);
                if (p.reqFieldnames.length == 0) {
                    return {
                        has: true,
                        description: '',
                        schema: this.type2schema(tyep)
                    }

                } else {
                    let f = p.reqFieldnames[0];
                    bodySchema.properties[f] = this.type2schema(tyep);
                    has = true;
                }
            }
        }

        return {
            has: has,
            description: '',
            schema: has ? bodySchema : undefined
        }

            ;

    }
    buildRequestBody(refClass: Classtype, paramsMeta: PropertyParamMeta[], methodMeta: MethodMeta): OpenAPI.IRequestBodyObject | OpenAPI.IReferenceObject | undefined {

        let schema = this.buildRequestBodySchema(refClass, paramsMeta, methodMeta);
        if (schema.has && schema.schema) {
            let ret: OpenAPI.IRequestBodyObject = {
                description: schema.description,
                content: {
                    "application/json": { schema: schema.schema }
                },
                required: false
            };
            return ret;
        }

        return undefined;
    }

    private buildClassaction(c: ActionClassMeta, parantData: IParentData) {

        //console.log(c)


        let meta = ReflectClassmeta.Resolve(c.Actionclass);

        let security = meta.attrGetClass(OpenAPIDecorator.$attrKey.security) || parantData.secureName;
        let operation: OpenAPI.IOperationObject = {
            summary: meta.methodGetDescription(c.actionMethod.methodname) || c.actionMethod.methodname,
            description: meta.classGetDescription(),
            operationId: c.fullname,
            parameters: this.buildRequestParams(c.Actionclass, c.properyParams, c.actionMethod),
            requestBody: this.buildRequestBody(c.Actionclass, c.properyParams, c.actionMethod),
            tags: c.basename ? [c.basename] : undefined,
            responses: this.buildResponse(c.Actionclass, c.actionMethod),
            security: security ? [{ [security]: [] }] : []
        }

        for (let path of c.fullpaths) {
            for (let path of c.fullpaths) {
                let p = this.convertPath(this.calssrouter.basePath + path);
                this.addAction(this.apiJson.paths, p, c.httpMethod, operation);
            }
        }
    }

    private buildMethodaction(c: ActionMethodMeta, parantData: IParentData) {
        let meta = ReflectClassmeta.Resolve(c.Controllerclass);
        let security = meta.attrGetClass(OpenAPIDecorator.$attrKey.security) || parantData.secureName;
        let operation: OpenAPI.IOperationObject = {
            summary: c.methodname,
            description: meta.methodGetDescription(c.methodname),
            operationId: c.fullname,
            parameters: this.buildRequestParams(c.Controllerclass, [], c.methodMeta),
            requestBody: this.buildRequestBody(c.Controllerclass, [], c.methodMeta),
            tags: c.basename ? [c.basename] : undefined,
            responses: this.buildResponse(c.Controllerclass, c.methodMeta),
            security: security ? [{ [security]: [] }] : []
        }


        for (let path of c.fullpaths) {
            let p = this.convertPath(this.calssrouter.basePath + path);
            this.addAction(this.apiJson.paths, p, c.httpMethod, operation)
        }

    }

    private addAction(items: OpenAPI.IPathsObject, path: string, method: HttpMethod, item: OpenAPI.IOperationObject) {
        let ii = items[path];
        if (!ii) {
            ii = items[path] = {};
        }

        if (method == HttpMethod.Get) {
            ii.get = item;
        } else if (method == HttpMethod.Post) {
            ii.post = item;
        } else if (method == HttpMethod.Put) {
            ii.put = item;
        } else if (method == HttpMethod.Delete) {
            ii.delete = item;
        } else if (method == HttpMethod.Head) {
            ii.head = item;
        }
    }

    private convertPath(path: string) {
        let tokens = UriTokenParser(path);
        return tokens.map((r: any) => {
            if (r.name) {
                return `${r.prefix}{${r.name}}`
            }
            return r.toString();
        }).join('');
    }


    type2schema(type: ReflectTypemeta): OpenAPI.ISchemaPrimary | OpenAPI.ISchemaComplex | OpenAPI.IReferenceObject {

        if (type.ref) {
            if (type.isArray) {
                let item = ReflectTypemeta.Factory(type.ref, false);
                return {
                    type: 'array',
                    items: this.type2schema(item)
                };
            }

            if (type.type == ReflectType.Boolean) {
                return { type: "boolean" };
            } else if (type.type == ReflectType.Date) {
                return { type: "string", format: "date" };
            } else if (type.type == ReflectType.Float) {
                return { type: "number" };
            } else if (type.type == ReflectType.Int) {
                return { type: "integer" };
            } else if (type.type == ReflectType.Void) {
                return { $ref: `#/components/schemas/__void` };
            } else if (type.type == ReflectType.String) {
                return { type: "string" };
            } else if (type.type == ReflectType.Complex) {
                let schemas = this.apiJson.components.schemas;
                let schemaName = type.name;
                if (schemaName in schemas) {
                    return { $ref: `#/components/schemas/${schemaName}` }
                }
                let meta = ReflectClassmeta.Resolve(type.ref || Object);
                let schema = schemas[schemaName] = {
                    "type": "object",
                    "required": [],
                    description: meta.classGetDescription() || undefined,
                    properties: {} as any
                };


                for (let p of meta.propertyNames()) {
                    let pt = meta.propertyGetType(p)
                    schema.properties[p] = this.type2schema(pt);
                }
                return { $ref: `#/components/schemas/${type.name}` }
            }


            throw new Error("SuportedTypes " + type.ref);
        }
        return { $ref: `#/components/schemas/__void` };
    }
}