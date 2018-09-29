import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import json from 'rollup-plugin-json';

export default {
    input: 'src/index.js',
    output: {
        file: 'dist/bedita-sdk.js',
        name: 'BEdita',
        format: 'umd',
    },
    plugins: [
        resolve(),
        json(),
        commonjs({
            include: [
                'node_modules/tv4/**/*',
            ],
        }),
        babel({
            include: [
                'node_modules/@chialab/**/*.js',
                'node_modules/chialab-*/**/*.js',
                'src/**/*.js',
            ],
        }),
    ],
};
