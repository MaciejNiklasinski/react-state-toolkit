import { main, module } from './package.json';
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "rollup-plugin-typescript2";

export default [
  {
    input: './index.ts',
    output: [
      {
        file: main,
        format: 'cjs',
        sourcemap: true  
      },
      {
        file: module,
        format: 'es',
        sourcemap: true  
      }
    ],
    plugins: [
      peerDepsExternal(),
      resolve(),
      commonjs(),
      typescript({ useTsconfigDeclarationDir: true }),
    ]
  }
];