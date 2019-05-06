import "reflect-metadata";
import { ClassrouterFactory, JsonResponseFilter, $types, ILogger } from "classrouter";
import { ApiController } from "./controller";
import express from 'express'
import { SampleLogger } from "./logger";
import { ClassrouterOpenAPI } from "../src";


async function startup() {
    let app = express();
    let factory = new ClassrouterFactory({
        basePath: '/v1',
        bind: (container) => {
            container.bind<ILogger>($types.Logger).to(SampleLogger).inSingletonScope();
        },
        controllers: [],
        responseFilters: {
            default: new JsonResponseFilter(),
            filters: []
        }
    });

    factory.build(app);

    new ClassrouterOpenAPI(factory)
        .build(app, 'v1')

    app.listen(3000, () => {
        console.log('listen 3000');
    });
}

startup().catch(console.log);