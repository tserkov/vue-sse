// http://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  parserOptions: {
    sourceType: 'module'
  },
  env: {
    browser: true,
  },
  extends: 'airbnb-base',
  rules: {
    // don't require .js extension when importing
    'import/extensions': ['error', 'always', {
      'js': 'never'
    }],
  }
}
