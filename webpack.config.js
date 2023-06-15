const webpack = require('webpack');

const Dotenv = require('dotenv-webpack');


module.exports = {
  
  plugins: [
    new Dotenv(),
    new webpack.DefinePlugin({
      'process.env': {
        OS_API_KEY: JSON.stringify(process.env.OS_API_KEY)
      }
    }),
  ],
  mode: process.env.NODE_ENV === 'development' ? 'development' : 'production',
  entry: {
    main : './app/assets/javascripts/main.js', 
    small : './app/assets/javascripts/main-small.js',
    mapv2 : './app/assets/javascripts/map-v2.js',
    mapv2alt : './app/assets/javascripts/map-v2-alt.js',
    mapv3 : './app/assets/javascripts/map-v3.js'       
          },
  output: {
    path: __dirname,
    filename: './app/assets/javascripts/bundles/[name].bundle.js'
  },
};


