import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';

export default {
    format: 'cjs',
    plugins: [
        resolve(),
        commonjs({
            include: [
                'node_modules/tv4/**/*',
                'node_modules/object-path/**/*',
            ],
        }),
        babel({
            include: [
                'node_modules/@chialab/**/*.js',
                'node_modules/chialab-*/**/*.js',
            ],
        }),
    ]
};
