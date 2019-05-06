import "reflect-metadata";
import { suite, test, only } from "mocha-typescript";
import { assert } from "chai";
import { ClassrouterOpenAPI } from "../src";
import { ClassrouterFactory, JsonResponseFilter } from "classrouter";
import { BasicController, BasicObject } from "./basic.controller";
import { ReflectClassmeta, ReflectTypemeta } from "@napp/reflect";
import { OpenAPI } from "../src/openapi.interface";

@suite()
class type2Schema {
    api: ClassrouterOpenAPI;
    constructor() {
        let factory = new ClassrouterFactory({
            bind: () => { },
            controllers: [BasicController],
            responseFilters: {
                default: new JsonResponseFilter(), filters: []
            }
        });
        this.api = new ClassrouterOpenAPI(factory);
    }

    @test()
    privateTypeInt() {
        {
            let schema = this.api.type2schema(ReflectTypemeta.Factory(Number, false))
            assert.equal((schema as OpenAPI.ISchemaPrimary).type, 'integer', 'int')
        }
        {
            let schema = this.api.type2schema(ReflectTypemeta.Factory('string', false))
            assert.equal((schema as OpenAPI.ISchemaPrimary).type, 'string', 'string')
        }
    }

    @test()
    primaryObject() {
        {
            let schema = this.api.type2schema(ReflectTypemeta.Factory(BasicObject, false));
            console.log(schema)
            console.log(JSON.stringify(this.api.apiJson.components.schemas))
            // assert.equal((schema as OpenAPI.ISchemaPrimary).type, 'integer', 'int')
        }

       
        
    }
}