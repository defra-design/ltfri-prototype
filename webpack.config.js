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
    main : './app/assets/javascripts/maps/main.js', 
    small : './app/assets/javascripts/maps/main-small.js',
    mapv2 : './app/assets/javascripts/maps/map-v2.js',
    mapv2alt : './app/assets/javascripts/maps/map-v2-alt.js',
    mapv3 : './app/assets/javascripts/maps/map-v3.js',
    mapv3_2 : './app/assets/javascripts/maps/map-v3-2.js',
    mapv3_3 : './app/assets/javascripts/maps/map-v3-3.js',
    mapv3_4 : './app/assets/javascripts/maps/map-v3-4.js',
    mapv3_5 : './app/assets/javascripts/maps/map-v3-5.js',
    mapv4 : './app/assets/javascripts/maps/map-v4.js',
    mapv5 : './app/assets/javascripts/maps/map-v5.js',
    mapv6 : './app/assets/javascripts/maps/map-v6.js'        
          },
  output: {
    path: __dirname,
    filename: './app/assets/javascripts/bundles/[name].bundle.js'
  },
};


