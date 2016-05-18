
const path = require('path');
const _ = require('lodash');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');

function getClientPath() {
  const rel = process.env.CLIENT_PATH || './client';
  return path.resolve(rel);
}

function base() {
  return {
    module: {
      loaders: [{
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },{
        test: /\.scss$/,
        loaders: ["style", "css", "postcss", "resolve-url", "sass?sourceMap"]
      },{
        test: /\.css$/,
        loaders: ["style", "css", "postcss"]
      },{
        test: /\.png$/,
        loader: "file-loader"
      },
        { test: /\.woff$/,   loader: "url-loader?limit=10000&minetype=font/woff" },
        { test: /\.woff2$/,   loader: "url-loader?limit=10000&minetype=font/woff2" },
        { test: /\.ttf$/,    loader: "file-loader" },
        { test: /\.eot$/,    loader: "file-loader" },
        { test: /\.svg$/,    loader: "file-loader" }
      ]
    },
    plugins: [],
    externals: {},
    resolve: {
      alias: {
        SHAREDJS: getClientPath() + '/sharedjs'
      }
    },
    postcss: function () {
      return [autoprefixer];
    }
  };
}

function inlineSourceMaps(wc) {
  wc.devtool = 'inline-source-map';
  return wc;
}

function sourceMaps(wc) {
  wc.devtool = 'source-map';
  return wc;
}

function uglify(wc) {
  wc.plugins.unshift(new webpack.optimize.UglifyJsPlugin());
  return wc;
}

function jsonLoader(wc) {
  wc.module.loaders.push({test: /\.json$/, loader: 'json'});
  return wc;
}

/* externals required if we want react to work correctly with karma */
function reactKarmaExternals(wc) {
  wc.externals['react/addons'] = true;
  wc.externals['react/lib/ExecutionEnvironment'] = true;
  wc.externals['react/lib/ReactContext'] = true;
  return wc;
}

/* so that we can use CLIENT_PATH in frontend test instead of specifying directory directly */
function karmaClientModuleAlias(wc) {
  wc.resolve.alias.CLIENT_PATH = getClientPath();
  return wc;
}

function babelRewirePlugin(wc) {
  wc.module.loaders[0].query = {
    "presets": [ "es2015", "react" ],
    "plugins": ["rewire"]
  }
  
  return wc;
}

const dev = _.flow(base, sourceMaps);
const prod = _.flow(base, uglify);
const karma =_.flow(base, inlineSourceMaps, jsonLoader, reactKarmaExternals, karmaClientModuleAlias, babelRewirePlugin);

module.exports = {
  dev: dev,
  prod: prod,
  karma: karma
};
