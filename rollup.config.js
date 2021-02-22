import buble from '@rollup/plugin-buble';
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { terser } from 'rollup-plugin-terser'
import pkg from './package.json';

const banner = `/*!
 * vue-sse v${pkg.version}
 * (c) ${new Date().getFullYear()} James Churchard
 * @license ISC
 */`

export default [
  {
    input: 'src/index.js',
    output: {
      banner,
      file: 'dist/vue-sse.esm.browser.js',
      format: 'es',
    },
    plugins: [
      resolve(),
      commonjs(),
    ],
  },
  {
    input: 'src/index.js',
    output: {
      banner,
      file: 'dist/vue-sse.esm.browser.min.js',
      format: 'es',
    },
    plugins: [
      resolve(),
      commonjs(),
      terser({ module: true })
    ],
  },
  {
    input: 'src/index.js',
    output: {
      banner,
      file: 'dist/vue-sse.esm.js',
      format: 'es',
    },
    plugins: [
      buble(),
      resolve(),
      commonjs(),
    ],
  },
  {
    input: 'src/index.cjs.js',
    output: {
      banner,
      file: 'dist/vue-sse.js',
      format: 'umd',
      name: 'VueSSE',
    },
    plugins: [
      buble(),
      resolve(),
      commonjs(),
    ],
  },
  {
    input: 'src/index.cjs.js',
    output: {
      banner,
      file: 'dist/vue-sse.min.js',
      format: 'umd',
      name: 'VueSSE',
    },
    plugins: [
      buble(),
      resolve(),
      commonjs(),
      terser({ module: false })
    ],
  },
  {
    input: 'src/index.cjs.js',
    output: {
      banner,
      file: 'dist/vue-sse.common.js',
      format: 'cjs',
      exports: 'default',
    },
    plugins: [
      buble(),
      resolve(),
      commonjs(),
    ],
  },
];
