/* eslint-disable no-console */

import { Factory } from '@chialab/synapse/src/factory.js';

export class Debug extends Factory {
    log(...args) {
        console.log('[BEDITA]', ...args);
    }

    warn(...args) {
        console.warn('[BEDITA]', ...args);
    }

    error(...args) {
        console.error('[BEDITA]', ...args);
    }
}