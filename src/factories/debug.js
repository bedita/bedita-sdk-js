/* eslint-disable no-console */

import { Factory } from '@chialab/synapse/src/factory.js';

let styles = 'font-family: monospace; color: #BBB;';

export class Debug extends Factory {
    log(...args) {
        if (typeof window !== 'undefined') {
            console.log('%c [BEDITA]', styles, ...args);
        } else {
            console.log('[BEDITA]', ...args);
        }
    }

    warn(...args) {
        if (typeof window !== 'undefined') {
            console.warn('%c [BEDITA]', styles, ...args);
        } else {
            console.warn('[BEDITA]', ...args);
        }
    }

    error(...args) {
        if (typeof window !== 'undefined') {
            console.error('%c [BEDITA]', styles, ...args);
        } else {
            console.error('[BEDITA]', ...args);
        }
    }
}
