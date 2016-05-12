const buildDefaultCommand = "clear && webpack --config ./webpack.config.js --progress";
const buildWatchCommand = "clear && webpack --config ./webpack.config.js --progress --watch";

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
