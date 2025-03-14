import webpack from 'webpack'
import path from 'path'
import CopyWebpackPlugin from 'copy-webpack-plugin'
import dotenv from 'dotenv'

const __dirname = path.dirname(new URL(import.meta.url).pathname)

dotenv.config({ path: path.join(__dirname, './.env') })

export default {
  entry: {
    map: path.join(__dirname, 'node_modules/@defra/flood-map/src/flood-map.js')
  },
  devtool: 'source-map',
  mode: 'development',
//   mode: 'production',
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, '.tmp/public/javascripts'),
    library: {
      name: 'defra',
      type: 'window'
    }
  },
  optimization: {
    splitChunks: {
      chunks () {
        return false
      }
    }
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        OS_VTAPI_DEFAULT_URL: JSON.stringify(process.env.OS_VTAPI_DEFAULT_URL),
        OS_VTAPI_DARK_URL: JSON.stringify(process.env.OS_VTAPI_DARK_URL),
        OS_VTAPI_DEFAULT_DRAW_URL: JSON.stringify(process.env.OS_VTAPI_DEFAULT_DRAW_URL),
        OS_VTAPI_DARK_DRAW_URL: JSON.stringify(process.env.OS_VTAPI_DARK_DRAW_URL)
      }
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'node_modules/@defra/flood-map/dist/*.css'),
          to: path.resolve(__dirname, '.tmp/public/stylesheets'),
          context: 'node_modules/@defra/flood-map/dist/'
        }
      ]
    }),
    new webpack.NormalModuleReplacementPlugin(
      /js\/provider\/os-maplibre\/provider\.js/,
      './js/provider/esri-sdk/provider.js'
    )
  ],
  module: {
    rules: [
      {
        test: /\.jsx?$/i,
        use: 'babel-loader',
        exclude: /node_modules\/(?!(@defra|event-target-polyfill)\/).*/
      },
      {
        test: /\.jsx?$/,
        use: 'magic-comments-loader',
        exclude: /node_modules\/(?!(@defra|@arcgis)\/).*/
      }
    ]
  },
  resolve: {
    extensions: ['.jsx', '.js']
  },
  target: ['web', 'es5'],
  performance: {
    maxEntrypointSize: 2048000,
    maxAssetSize: 2048000
  }
}