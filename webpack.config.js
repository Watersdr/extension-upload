const path = require('path');
const webpack = require('webpack');

const env = process.env.NODE_ENV || 'development';
const isProduction = env === 'production';

const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const htmlPage = (title, filename, chunks, template) => new HtmlWebpackPlugin({
  title,
  hash: true,
  cache: true,
  inject: 'body',
  filename: './pages/' + filename + '.html',
  template: template || path.resolve(__dirname, './page.ejs'),
  appMountId: 'app',
  chunks,
});

const config = {
  mode: env,
  context: __dirname + '/src',
  entry: {
    'background': './background.js',
    'content/content': './main.js',
  },
  output: {
    path: __dirname + '/dist',
    filename: '[name].js',
  },
  resolve: {
    extensions: [
      '.js',
      '.vue',
      '.jsx',
    ],
    alias: {
      'base-styles': path.resolve(__dirname, './src/common/base-styles.scss'),
      'common': path.resolve(__dirname, './src/common'),
      'content': path.resolve(__dirname, './src/content'),
      'store': path.resolve(__dirname, './src/store'),
    },
  },
  module: {
    rules: [

      // vue loader
      {
        test: /\.vue$/,
        use: ['vue-loader'],
      },

      // js/jsx loader
      {
        test: /\.jsx?$/,
        exclude: file => /node_modules/.test(file) && !/\.vue\.js/.test(file),
        use: ['babel-loader'],
      },

      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'fonts/[name].[ext]',
        },
      },

      // css/scss loader
      {
        test: /\.(sa|sc|c)?ss$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: { modules: false },
          },
          {
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              map: false,
              plugins: () => [
                require('postcss-preset-env')({ browsers: ['last 2 versions']}),
                require('css-mqpacker')(),
                require('cssnano')({
                  calc: { precision: 2 },
                  discardEmpty: true,
                  discardDuplicates: true,
                  discardComments: { removeAll: true },
                }),
              ],
            },
          },
          {
            loader: 'sass-loader',
            options: {
              outputStyle: isProduction ? 'compressed' : 'expanded',
              includePaths: [path.resolve(__dirname, './node_modules')],
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin({ dry: true }),
    new CopyWebpackPlugin([
      {
        from: 'icons',
        to: 'icons',
      }, {
        from: 'manifest.json',
        to: 'manifest.json',
      },
    ]),
    new MiniCssExtractPlugin({ filename: '[name].css' }),
    new VueLoaderPlugin(),
  ],
  performance: { hints: false },
};

if(process.env.NODE_ENV === 'production') {
  config.plugins = (config.plugins || []).concat([
    // eslint-disable-next-line array-element-newline
    new webpack.DefinePlugin({ 'process.env': { NODE_ENV: '"production"' }}),
    new webpack.LoaderOptionsPlugin({ minimize: true }),
  ]);

  // order for these two searches are important. If the second runs first, the import gets screwed before it can be removed
  config.module.rules.push({
    test: /\.(vue|jsx?)$/,
    loader: 'string-replace-loader',
    options: {
      multiple: [
        {
          search: "import.*console-dev';",
          replace: '',
          flags: 'g',
        }, {
          search: 'console\.dev.*;',
          replace: '',
          flags: 'g',
        },
      ],
    },
  });
}
else {
  config.devtool = '#cheap-module-source-map';
}

module.exports = config;
