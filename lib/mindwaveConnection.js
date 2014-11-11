var net = require('net');
var when = require('when');

function connect(options){
  return when.promise(function(resolve, reject){
    var client = net.createConnection({
      port : options.mindwavePort ,
      host : options.mindwaveHost
    }, function(){
      console.log(arguments);
      client.write(JSON.stringify({
        appName : 'meshblu-mindwave',
        appKey : 'f974c3f0-5ff6-11e4-aa15-123b93f75cba',
        format : 'json'
      }));
      resolve(client);
    });
  });
}

module.exports = {
    connect : connect
};

