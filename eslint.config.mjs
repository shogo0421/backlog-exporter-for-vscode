import {includeIgnoreFile} from '@eslint/compat'
import oclif from 'eslint-config-oclif'
import prettier from 'eslint-config-prettier'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

const gitignorePath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '.gitignore')

/** @see https://github.com/ShuntaToda/backlog-exporter/blob/main/eslint.config.mjs */
export default [
  includeIgnoreFile(gitignorePath),
  {
    ignores: ['eslint.config.mjs', 'vite.config.ts', 'media/panel.js'],
  },
  ...oclif,
  prettier,
  {
    files: ['**/*.ts'],
    rules: {
      // VS Code 拡張のソースは CLI より camelCase ファイル名が一般的
      'unicorn/filename-case': ['error', {case: 'camelCase'}],
    },
  },
]
