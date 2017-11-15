//@ts-check

/* import tv4 from 'tv4';


tv4.addFormat('date-time', (data) => {
    if (typeof data === 'string') {
        data = new Date(data);
    }
    if ((data instanceof Date) && !isNaN(data.getTime())) {
        return null;
    }
    return 'Invalid date';
}); */

/**
 * 
 * 
 */
const SCHEMA = {
    definitions: {
        metadata: {
            type: 'object',
            additionalProperties: true,
            properties: {
                created: {
                    type: 'string',
                    format: 'date-time',
                },
                modified: {
                    type: 'string',
                    format: 'date-time',
                },
            },
        },
    },
};

/**
 * 
 * 
 */
export class Model {
    /**
     * 
     * 
     */
    get type() {
        return this.constructor.name;
    }

    /**
     * 
     * 
     */
    static get schema() {
        return SCHEMA;
    }
}
