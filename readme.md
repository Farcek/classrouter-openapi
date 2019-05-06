## Classrouter OpenAPI 3. 
---------------------------------------

swagger api doc generator

```typescript
    // sample

    ...

    new ClassrouterOpenAPI(factory)
        .setInfo({
            version: 'v3',
            title: 'Userly api service'
        })
        .setServers([{ url: '/', description: 'local server' }])
        .addSecurity(SecurityNames.UserToken,'bearer')
        .addSecurity(SecurityNames.ClientToken,'bearer')
        .build(app, 'v1');
    ...

```