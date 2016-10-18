require('ts-node').register({
  project: __dirname + "/app/world/tsconfig.json",
  fast: true
});
var pomelo = require('pomelo');
var worldConfig = require("./config/world.json");
const fs = require("fs");

/**
 * Init app for client.
 */
var app = pomelo.createApp();
// app.enable('systemMonitor');
app.set('name', 'TheLastShip');
// app configuration
app.configure('production|development', 'connector', function() {
  console.log("CONNECTOR!!!")

  const __error_log_file_name = "./logs/uncaught.connector.log";
  process.on("uncaughtException", function(err) {
    var d = new Date();
    fs.writeFileSync(__error_log_file_name,
      `---------${d.toLocaleDateString()} ${d.toLocaleTimeString()}----------\n` +
      (err.stack || err) +
      "\n\n", {
        flag: 'a'
      })
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

  const __error_log_file_name = "./logs/uncaught.gate.log";
  process.on("uncaughtException", function(err) {
    var d = new Date();
    fs.writeFileSync(__error_log_file_name,
      `---------${d.toLocaleDateString()} ${d.toLocaleTimeString()}----------\n` +
      (err.stack || err) +
      "\n\n", {
        flag: 'a'
      })
  });

  app.set('connectorConfig', {
    connector: pomelo.connectors.hybridconnector,
    useProtobuf: false
  });
});
app.configure('production|development', 'world', function() {
  console.log("WORLD???");

  const __error_log_file_name = "./logs/uncaught.world.log";
  process.on("uncaughtException", function(err) {
    var d = new Date();
    fs.writeFileSync(__error_log_file_name,
      `---------${d.toLocaleDateString()} ${d.toLocaleTimeString()}----------\n` +
      (err.stack || err) +
      "\n\n", {
        flag: 'a'
      })
  });

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
  const __error_log_file_name = "./logs/uncaught.master.log";
  console.error(' Caught exception: ' + err.stack);
  var d = new Date();
  fs.writeFileSync(__error_log_file_name,
    `---------${d.toLocaleDateString()} ${d.toLocaleTimeString()}----------\n` +
    (err.stack || err) +
    "\n\n", {
      flag: 'a'
    })
});