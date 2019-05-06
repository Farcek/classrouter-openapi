import { Get, Post, Controller } from "classrouter";

@Controller({
    name : 'api',
    path : '/api'
})
export class ApiController {

    @Get({ path: '/list' })
    list() {
        return [1, 2]
    }

    @Post({ path: '/save' })
    save() {
        return "ok";
    }
}