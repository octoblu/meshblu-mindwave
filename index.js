var util = require('util');
var EventEmitter = require('events').EventEmitter;
var Mindwave = require('./lib/mindwaveConnection');
var _ = require('lodash');
var debug = require('debug')('meshblu-mindwave:index');


var MESSAGE_SCHEMA = {};

var DEFAULT_OPTIONS = {
      mindwaveHost : '127.0.0.1',
      mindwavePort : '13854',
      relayUUID : '*',
      broadcastInterval : 100
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
    broadcastInterval : {
      type : 'number',
      required : true,
      default : 100
    },
    relayUUID : {
      type : 'string',
      required : false,
      default : '*'
    }
  }
};

function Plugin(){
  var self = this; 
  self.options = DEFAULT_OPTIONS;
  self.messageSchema = MESSAGE_SCHEMA;
  self.optionsSchema = OPTIONS_SCHEMA;
  return self;
}
util.inherits(Plugin, EventEmitter);

Plugin.prototype.onMessage = function(message){
};

Plugin.prototype.setOptions = function(options){
  debug('setting options', options);
  var self = this;
  self.options = options || DEFAULT_OPTIONS;
  self._mindwaveConnection = null;


  self.getMindwaveConnection().then(function(mindwaveConnection){
    self._mindwaveConnection = mindwaveConnection; 
    var throttledEmit = _.throttle(function(){
      self.emit.apply(self, arguments);
    }, self.options.broadcastInterval);

    mindwaveConnection.on('data', function (result) {
      console.log(result.toString());
      var jsonData;
      try {
        jsonData = JSON.parse(result.toString());
        debug(JSON.stringify(jsonData, null, 2));
        if(jsonData.blinkStrength || jsonData.eSense ){
          debug('Received mindwave data', jsonData);
          throttledEmit('data', {payload : jsonData});
        }
      } catch (e) {
        console.error('Error parsing data:', e);
      }
    });

    mindwaveConnection.on('error', function(error){
      debug('Error:', error); 
      console.error('meshblu-mindwave:connection-error', error); 
    });
    mindwaveConnection.on('end', function () {
      console.log('mindwave client disconnected');
    });

  }).catch(function(error){
    self.emit('data', {error: 'Could not connect to mindwave'});
  });
};

Plugin.prototype.getMindwaveConnection = function(){
  var self = this;
  if(self._mindwaveConnection){
    return self._mindWaveConnection;
  }

  return Mindwave.connect(self.options).then(function(mindwaveConnection){
     self._mindwaveConnection = mindwaveConnection;
     return mindwaveConnection;
  });
};


module.exports = {
  messageSchema: MESSAGE_SCHEMA,
  optionsSchema: OPTIONS_SCHEMA,
  defaultOptions : DEFAULT_OPTIONS,
  Plugin: Plugin
};
