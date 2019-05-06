import { ILogger } from "classrouter";
import { injectable } from "inversify";


@injectable()
export class SampleLogger implements ILogger {

    error(message: string, attr?: Object | undefined) {
        this.write('error', message, attr);
    }


    warn(message: string, attr?: Object | undefined) {
        this.write('warn', message, attr);
    }
    info(message: string, attr?: Object | undefined) {
        this.write('info', message, attr);
    }

    verbose(message: string, attr?: Object | undefined) {
        this.write('verbose', message, attr);
    }
    debug(message: string, attr?: Object | undefined) {
        this.write('debug', message, attr);
    }
    write(level: string, message: string, attr?: Object | undefined) {
        console.log(level.toUpperCase(), ':', message, attr || {});
    };




}