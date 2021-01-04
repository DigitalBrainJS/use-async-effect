import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import replace from '@rollup/plugin-replace';
import json from '@rollup/plugin-json';

export default
    {
        plugins: [
            babel({
                exclude: 'node_modules/**',
                babelHelpers: 'bundled',
                plugins: [],
                presets: [
                    "@babel/preset-react"
                ]
            }),
            replace({
                'process.env.NODE_ENV': JSON.stringify( 'production' )
            }),
            resolve({
                browser: true,
                preferBuiltins: false
            }),
            json(),
            commonjs({
                extensions: ['.js', '.jsx']
            })
        ]
    };
