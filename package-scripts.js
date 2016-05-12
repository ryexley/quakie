const buildDefaultCommand = "clear && cp -rf ./src/i18n/locales ./server/public && webpack --config ./webpack.config.js --progress";
const buildWatchCommand = "clear && cp -rf ./src/i18n/locales ./server/public && webpack --config ./webpack.config.js --watch --progress";

module.exports = {
  scripts: {
    build: {
      default: buildDefaultCommand,
      watch: buildWatchCommand
    },
    server: {
      default: "clear && DEBUG=quakie* ./node_modules/.bin/node-dev ./bin/server"
    }
  }
};
