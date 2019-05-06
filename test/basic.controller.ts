import { Get, Post, Controller, QueryParam, BodyParam, CookieParam } from "classrouter";
import { Description, Name, Type, Return } from "@napp/reflect";
import { OpenAPIDecorator } from "../src";


@Name('aObj')
export class AObject {

    @Description('BasicObject - name')
    id: string = '';

    @Name('pFoo')
    foo: number = 1;

    @Type('float')
    baa: number = 2;
}
@Description('the BasicObject dto class')
export class BasicObject {

    @Description('BasicObject - name')
    name: string = '';

    @Name('age-pbject')
    age: number = 1;

    @Description('aObject a instance')
    a: AObject = new AObject()
}

@Controller({
    name: 'basic',
    path: '/basic'
})
@Description('the basic controller')
export class BasicController {

    @Get({ path: '/list' })
    @Return('int', true)
    @Description('basic list action. the description sample')
    list(
        @QueryParam('id') @Description('this id user id yum shu') id: string
    ): Number[] {
        return [1, 2]
    }

    @Post({ path: '/save' })
    save(
        @CookieParam('cid') @Description('coockie id desc') id: number,
        @BodyParam() @Description('request body desctipyion . ***') body: BasicObject
    ): string {
        return "ok";
    }
}