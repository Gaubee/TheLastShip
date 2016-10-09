require('ts-node').register({
  project: __dirname + "/app/world/tsconfig.json",
  fast: true
});
var pomelo = require('pomelo');
var worldConfig = require("./config/world.json");

/**
 * Init app for client.
 */
var app = pomelo.createApp();
app.set('name', 'TheLastShip');
// app configuration
app.configure('production|development', 'connector', function() {
  console.log("CONNECTOR!!!")
  var QuadTreeWorld = require("../web-server/app/engine/QuadTreeWorld").default;
  app.quadtree = new QuadTreeWorld({
    width:worldConfig.width,
    height:worldConfig.height,
    x:0,
    y:0,
  });
  app.set('connectorConfig', {
    connector: pomelo.connectors.hybridconnector,
    // heartbeat: 3,
    // useDict: true,
    useProtobuf: false
  });
});
app.configure('production|development', 'gate', function() {
  console.log("GATE???");
  app.set('connectorConfig', {
    connector: pomelo.connectors.hybridconnector,
    useProtobuf: false
  });
});
app.configure('production|development', 'world', function() {
  console.log("WORLD???");
  app.world = require("./app/world/index").default;
  // console.log(app.world);
  // require("./app/world/lib/pixi/test");
  app.set('connectorConfig', {
    connector: pomelo.connectors.hybridconnector,
    useProtobuf: false
  });
});

// start app
app.start();

process.on('uncaughtException', function(err) {
  console.error(' Caught exception: ' + err.stack);
});