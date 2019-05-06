import "reflect-metadata";
import { suite, test, only } from "mocha-typescript";
import { assert } from "chai";
import { ClassrouterOpenAPI } from "../src";
import { ClassrouterFactory, JsonResponseFilter } from "classrouter";
import { BasicController, BasicObject } from "./basic.controller";
// import { ReflectClassmeta, ReflectTypemeta } from "@napp/reflect";
// import { OpenAPI } from "../src/openapi.interface";

@suite()
class type2Schema {
    basicAPI: ClassrouterOpenAPI;
    constructor() {
        let factory = new ClassrouterFactory({
            bind: () => { },
            controllers: [BasicController],
            responseFilters: {
                default: new JsonResponseFilter(), filters: []
            }
        });
        this.basicAPI = new ClassrouterOpenAPI(factory);
    }

    @test()
    @only
    testA() {
        this.basicAPI.build({}, '/v1');
        let json = JSON.stringify(this.basicAPI.apiJson, undefined, 4);

        const fs = require('fs');
        fs.writeFile("test.json", json, function (err: any) {
            if (err) {
                return console.log(err);
            }

            console.log("The file was saved!");
        });
    }


}