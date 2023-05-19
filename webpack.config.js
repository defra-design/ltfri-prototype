const webpack = require('webpack');

const Dotenv = require('dotenv-webpack');


module.exports = {
  
  plugins: [
    new Dotenv()
  ],
  mode: process.env.NODE_ENV === 'dev' ? 'dev' : 'production',
  entry: { 
    
  main : './app/assets/javascripts/main.js', 
  small : './app/assets/javascripts/main-small.js'  
},
  output: {
    path: __dirname,
    filename: './app/assets/javascripts/[name].bundle.js'
  },
};


