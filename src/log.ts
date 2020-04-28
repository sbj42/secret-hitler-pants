export type Logger = (msg: string) => void;

let LOGGER: Logger | undefined;

export function setLogger(logger: Logger | undefined) {
    LOGGER = logger;
}

export function log(msg: string) {
    if (LOGGER) {
        LOGGER(msg);
    }
}
