var net = require('net');
var when = require('when');
var debug = require('debug')('meshblu-mindwave:lib/mindwaveConnection');

function connect(options){
  return when.promise(function(resolve, reject){
    var client = net.createConnection({
      port : options.mindwavePort ,
      host : options.mindwaveHost
    }, function(err ){
      if(err){
        debug('Error: could not connect to mindwave. Check that the mindwave is paired and the ThinkGear connector is running on your machine'); 
       return reject({
          error : 'Could not connect to Mindwave'
        });
      }

      client.write(JSON.stringify({
        appName : 'meshblu-mindwave',
        appKey : '824620562b95c8f5c015898fa6aa4c264bfdd40e',
        format : 'json'
      }));
      return resolve(client);
    });
  });
}

module.exports = {
    connect : connect
};

