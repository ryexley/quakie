module.exports = {
  scripts: {
    build: {
      default: "clear && webpack --config ./webpack.config.js",
      watch: "clear && webpack --config ./webpack.config.js --watch"
    },
    server: {
      default: "clear && DEBUG=quakie* ./node_modules/.bin/node-dev ./bin/server"
    }
  }
};
