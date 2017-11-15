import { Factory } from '../factory.js';

let styles = 'font-family: monospace; color: #BBB;';

export class Debug extends Factory {
    log(...args) {
        console.log('%c [BEDITA]', styles, ...args);
    }

    warn(...args) {
        console.warn('%c [BEDITA]', styles, ...args);
    }

    error(...args) {
        console.error('%c [BEDITA]', styles, ...args);
    }
}
