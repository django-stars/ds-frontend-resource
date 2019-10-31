module.exports = function(api) {
  api.cache(true)

  const presets = ['@babel/preset-react', [
    '@babel/preset-env',
    {
      useBuiltIns: 'usage',
      corejs: '2.0.0',
      targets: '> 0.25%, last 2 versions, Firefox ESR, not dead',
    },
  ]]
  const plugins = [
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    // '@babel/plugin-proposal-function-sent',
    '@babel/plugin-proposal-numeric-separator',
    '@babel/plugin-proposal-throw-expressions',

    // stage 3
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-syntax-import-meta',
    ['@babel/plugin-proposal-class-properties', { loose: false }],
    '@babel/plugin-proposal-json-strings',
    '@babel/plugin-proposal-export-namespace-from',
    '@babel/proposal-class-properties',
    'react-require',
  ]

  return {
    presets,
    plugins,
  }
}
