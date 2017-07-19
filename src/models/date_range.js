import { internal, Model } from '@chialab/synapse';

const SCHEMA = {
    type: 'object',
    properties: {
        start_date: {
            oneOf: [
                { type: 'null' },
                { type: 'string', format: 'date-time' },
                { type: 'object', format: 'date-time' },
            ],
        },
        end_date: {
            oneOf: [
                { type: 'null' },
                { type: 'string', format: 'date-time' },
                { type: 'object', format: 'date-time' },
            ],
        },
    },
    required: ['start_date', 'end_date'],
};

export class DateRangeModel extends Model {
    static get schema() {
        return SCHEMA;
    }

    get start_date() {
        return internal(this).start_date;
    }

    set start_date(d) {
        if (d) {
            d = new Date(d);
            d.setUTCHours(0, 0, 0, 0);
        }
        internal(this).start_date = d;
    }

    get end_date() {
        return internal(this).end_date;
    }

    set end_date(d) {
        if (d) {
            d = new Date(d);
            d.setUTCHours(23, 59, 59, 0);
        }
        internal(this).end_date = d;
    }
}
