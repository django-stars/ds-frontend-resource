module.exports = function(api) {
  api.cache(true)

  const presets = [ '@babel/preset-env', '@babel/preset-react' ]
  const plugins = [
    '@babel/proposal-class-properties',
    'react-require',
  ]

  return {
    presets,
    plugins,
  }
}