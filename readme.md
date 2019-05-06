## Classrouter OpenAPI 3. 
---------------------------------------

swagger api doc generator

```typescript
// sample

import "reflect-metadata";
import { ClassrouterFactory, ILogger } from "classrouter";

import { serviceConf } from "./config";
import { MainController } from "./api/controller";

import { SampleLogger } from "./logger";
import { $types } from "classrouter";
import { JsonResponseFilter } from "classrouter";
import { ClassrouterOpenAPI } from "classrouter-openapi";
import { Database } from "@entity";
import { SecurityNames } from "./common";





const express = require("express");
const morgan = require("morgan");
const swaggerUi = require('swagger-ui-express');




async function bootstrap() {
    const app = express();

    app.use(morgan("dev"));
    console.log("running env", app.get('env'));

    await new Database().connect();

    const factory = new ClassrouterFactory({
        basePath: '/v3',
        bind: (container) => {
            container.bind<ILogger>($types.Logger).to(SampleLogger).inSingletonScope();
        },
        controllers: [MainController],
        responseFilters: {
            default: new JsonResponseFilter(),
            filters: []
        }
    });

    factory.build(app);



    let openapi = new ClassrouterOpenAPI(factory)
        .setInfo({
            version: 'v3',
            title: 'Userly api service'
        })
        .setServers([{ url: '/', description: 'local server' }])
        .addSecurity(SecurityNames.UserToken, 'bearer')
        .addSecurity(SecurityNames.ClientToken, 'bearer')
        .build();

    app.get(`/v3/api.json`, (req: any, res: any) => res.json(openapi.apiJson));
    app.use(`/v3/api-doc`, swaggerUi.serve, swaggerUi.setup(null, {
        swaggerUrl: `/v3/api.json`,
        explorer: true,
        swaggerOptions: {
        }
    }));

    app.listen(serviceConf.port, serviceConf.ip, () => {
        console.log(`start ${serviceConf.baseUrl}. listen port ${serviceConf.port}`);
    });
}

bootstrap().catch(console.error);


```