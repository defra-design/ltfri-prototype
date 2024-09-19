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
    // Maps are 1 version behind the /version folder (i.e /version_5 has mapv4 bundle)
    // Pre-nafra2 maps
    main : './app/assets/javascripts/maps/pre-nafra/main.js', 
    small : './app/assets/javascripts/maps/pre-nafra/main-small.js',
    mapv2 : './app/assets/javascripts/maps/pre-nafra/map-v2.js',
    mapv2alt : './app/assets/javascripts/maps/pre-nafra/map-v2-alt.js',
    mapv3 : './app/assets/javascripts/maps/pre-nafra/map-v3.js',
    mapv3_2 : './app/assets/javascripts/maps/pre-nafra/map-v3-2.js',
    mapv3_3 : './app/assets/javascripts/maps/pre-nafra/map-v3-3.js',
    mapv3_4 : './app/assets/javascripts/maps/pre-nafra/map-v3-4.js',
    mapv3_5 : './app/assets/javascripts/maps/pre-nafra/map-v3-5.js',
    mapv4 : './app/assets/javascripts/maps/pre-nafra/map-v4.js',
    mapv5 : './app/assets/javascripts/maps/pre-nafra/map-v5.js',
    mapv6 : './app/assets/javascripts/maps/pre-nafra/map-v6.js',
    mapv7 : './app/assets/javascripts/maps/pre-nafra/map-v7.js',
    mapv7direct : './app/assets/javascripts/maps/pre-nafra/map-v7-direct.js',
    mapv7_2 : './app/assets/javascripts/maps/pre-nafra/map-v7-2.js',
    mapv7_2direct : './app/assets/javascripts/maps/pre-nafra/map-v7-2-direct.js',
    // Nafra 2 maps
    mapv8 : './app/assets/javascripts/maps/nafra2/map-v8.js',
    mapv8direct : './app/assets/javascripts/maps/nafra2/map-v8-direct.js',
    mapv8_1 : './app/assets/javascripts/maps/nafra2/map-v8-1.js',
    mapv8direct_1 : './app/assets/javascripts/maps/nafra2/map-v8-direct-1.js',
    mapv9 : './app/assets/javascripts/maps/nafra2/map-v9.js',
    mapv9direct : './app/assets/javascripts/maps/nafra2/map-v9-direct.js',
    mapv9_2 : './app/assets/javascripts/maps/nafra2/map-v9-2.js',
    mapv9direct_2 : './app/assets/javascripts/maps/nafra2/map-v9-direct-2.js',
    mapv10 : './app/assets/javascripts/maps/nafra2/map-v10.js',
    mapv10_b : './app/assets/javascripts/maps/nafra2/map-v10-b.js',
    mapv10direct : './app/assets/javascripts/maps/nafra2/map-v10-direct.js',
    mapv10direct_b : './app/assets/javascripts/maps/nafra2/map-v10-direct-b.js',
    mapv11 : './app/assets/javascripts/maps/nafra2/map-v11.js',
    mapv12 : './app/assets/javascripts/maps/nafra2/map-v12.js',
    mapv12direct : './app/assets/javascripts/maps/nafra2/map-v12-direct.js',
    mapv13 : './app/assets/javascripts/maps/nafra2/map-v13.js',

    // A map with new nafra2 designs for the live service as of April 2024
    mapv8_3 : './app/assets/javascripts/maps/redesign-pre-nafra2.js',

    mapv15_1 : './app/assets/javascripts/maps/nafra2/map-v15-1.js',
    mapv15_1_direct : './app/assets/javascripts/maps/nafra2/map-v15-1-direct.js',
    mapv15_1_mobile : './app/assets/javascripts/maps/nafra2/map-v15-1-mobile.js',
    mapv15_1_direct_mobile : './app/assets/javascripts/maps/nafra2/map-v15-1-direct-mobile.js',
    mapv17 : './app/assets/javascripts/maps/nafra2/map-v17.js'

          },
  output: {
    path: __dirname,
    filename: './app/assets/javascripts/bundles/[name].bundle.js'
  },
};


