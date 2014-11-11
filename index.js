var util = require('util');
var EventEmitter = require('events').EventEmitter;
var mindwave = require('./lib/mindwaveConnection'); 

var MESSAGE_SCHEMA = {};

var DEFAULT_OPTIONS = {
      mindwaveHost : '127.0.0.1', 
      mindwavePort : '13854'
};

var OPTIONS_SCHEMA = {
  type: 'object',
  properties: {
    mindwaveHost: {
      type: 'string',
      required: true, 
      default : '127.0.0.1'
    }, 
    mindwavePort : {
      type: 'string',
      required: true, 
      default : '13854'
    }, 
    relayUUID : {
      type : 'string',
      required : false,
      default : '*'
    }
  }
};

function Plugin(options){
  var self = this; 
  options = options || DEFAULT_OPTIONS; 
  self.options = options;
  this.messageSchema = MESSAGE_SCHEMA;
  this.optionsSchema = OPTIONS_SCHEMA;

  return this;
}
util.inherits(Plugin, EventEmitter);

Plugin.prototype.onMessage = function(message){
  var payload = message.payload;
  this.emit('message', {devices: [this.options.relayUUID || '*'], topic: 'echo', payload: payload});
};

Plugin.prototype.setOptions = function(options){
  this.options = options;
};


Plugin.prototype.getDefaultOptions = function(){
    return DEFAULT_OPTIONS; 
}; 

Plugin.prototype.setupMindwaveConnection = function(){
    var self = this; 
    mindwave.connect(self.options)
      .then(function(mindwaveConnection){
        var jsonDataBuffer = '';
        mindwaveConnection.on('data', function (result) {
            try {
                jsonData = JSON.parse(result.toString());
                if(jsonData.blinkStrength || jsonData.eSense ){
                    console.log('sending skynet message');
                    var data = {
                        devices : self.options.relayUUID || '*',
                        payload : jsonData
                    };
                    self.emit('message', data);
                    console.log('Message sent to skynet ');
                    console.log(data);
                }
            } catch (e) {
              
            }
        });

        mindwaveConn.on('end', function () {
            console.log('Socket connection ended', arguments); 
            console.log('mindwave client disconnected');
        });

      });
   
}; 


module.exports = {
  messageSchema: MESSAGE_SCHEMA,
  optionsSchema: OPTIONS_SCHEMA,
  Plugin: Plugin
};
