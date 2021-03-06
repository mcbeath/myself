const path = require('path');
// const UglifyJsPlugin = require("uglifyjs-webpack-plugin")
// const myPlugin = [
//   new UglifyJsPlugin(
//     {
//       uglifyOptions: {
//         warnings: false,
//         compress: {
//           drop_debugger: true,
//           drop_console: true
//         }
//       }
//     }
//   )
// ]
process.env.GENERATE_SOURCEMAP = 'false';
const {
  override,
  fixBabelImports,
  addWebpackAlias,
  overrideDevServer,
  addLessLoader,
  addPostcssPlugins
} = require('customize-cra'); // show https://github.com/arackaf/customize-cra
const CompressionWebpackPlugin = require('compression-webpack-plugin');

function resolve(dir) {
  return path.join(__dirname, '.', dir)
}

const addCustomize = () => config => {
  if (process.env.NODE_ENV === 'production') {
    // 关闭sourceMap
    config.devtool = false;
    // 配置打包后的文件位置
    // config.output.path = resolve('dist');
    // config.output.publicPath = './';
    // 添加js打包gzip配置
    config.plugins.push(
      new CompressionWebpackPlugin({
        test: /\.js$|\.css$/,
        threshold: 1024,
      }),
    )
  }
  return config;
}

const devServerConfig = () => config => {
  return {
    ...config,
    proxy: {
      '/api': {
        target: 'xxx',
        changeOrigin: true,
        pathRewrite: {
          '^/api': '/api',
        },
      }
    }
  }
}

module.exports = {
  webpack: override(
    // 配置antd 的按需引入
    fixBabelImports('import', {
      libraryName: 'antd-mobile',
      style: 'css'
    }),
    // 配置路径访问快捷键 @/xxx
    addWebpackAlias({
      '@': resolve('src'),
    }),
    // postCss 自动将px转为rem 需要配合 lib-flexible 使用
    addPostcssPlugins([
      require('postcss-pxtorem')({ rootValue: 36, propList: ['*'], minPixelValue: 2, selectorBlackList: ['am-'] })
    ]),
    addLessLoader(),
    // 压缩js等
    // addCustomize(),
    (config) => { //暴露webpack的配置 config ,evn
      // console.log('config', config)
      // process.env.GENERATE_SOURCEMAP = 'false';

      return config
    }
  ),
  // 本地启动配置，可以设置代理
  devServer: overrideDevServer(
    devServerConfig()
  )
};