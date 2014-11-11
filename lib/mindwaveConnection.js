var net = require('net');
var when = require('when');

function connect(options){
  return when.promise(function(resolve, reject){
    var client = net.createConnection({
      port : options.mindwavePort ,
      host : options.mindwaveHost
    }, function(){
      client.write(JSON.stringify({
        appName : 'meshblu-mindwave',
        appKey : '824620562b95c8f5c015898fa6aa4c264bfdd40e',
        format : 'json'
      }));
      resolve(client);
    });
  });
}

module.exports = {
    connect : connect
};

