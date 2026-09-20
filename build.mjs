import { readFileSync, rmSync, writeFileSync } from 'node:fs'
import { build } from 'esbuild'

const id = 'dsh-web-notify'

await build({
  entryPoints: ['src/client/index.ts'],
  bundle: true,
  format: 'cjs',
  platform: 'browser',
  target: 'es2020',
  jsx: 'automatic',
  external: ['react', 'react/jsx-runtime'],
  outfile: 'lib/tmp/client.cjs',
  sourcemap: false,
  logLevel: 'silent',
})

const body = readFileSync('lib/tmp/client.cjs', 'utf8')
rmSync('lib/tmp', { recursive: true, force: true })

writeFileSync(
  'lib/client.js',
  [
    'window.__ModuleLoader__.load({',
    `\tid: ${JSON.stringify(id)},`,
    '\tfactory: (require) => {',
    '\t\tvar module = { exports: {} };',
    '\t\tvar exports = module.exports;',
    body,
    '\t\treturn module.exports;',
    '\t}',
    '});',
    '',
  ].join('\n'),
)
