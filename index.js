var util         = require('util');
var EventEmitter = require('events').EventEmitter;
var Mindwave     = require('./lib/mindwaveConnection');
var _            = require('lodash');
var debug        = require('debug')('meshblu-mindwave');

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
  var payload = message.payload;
  this.emit('message', {devices: [this.options.relayUUID || '*'], topic: 'echo', payload: payload});
};

Plugin.prototype.setOptions = function(options){
  debug('setting options', options);
  var self = this;
  self.options = options;
  self._mindwaveConnection = null;

  self.getMindwaveConnection().then(function(mindwaveConnection){
    debug('connected to mindwave');
    var throttledEmit = _.throttle(function(){
      self.emit.apply(self, arguments);
    }, self.options.broadcastInterval);

    mindwaveConnection.on('data', function (result) {
      debug(result.toString());
      var jsonData;
      try {
        jsonData = JSON.parse(result.toString());
        debug(JSON.stringify(jsonData, null, 2));
        if(jsonData.blinkStrength || jsonData.eSense ){
          debug('sending skynet message');
          var data = {
            devices : [ self.options.relayUUID || '*'],
            payload : jsonData
          };
          throttledEmit('data', data);
        }
      } catch (e) {
        console.error(e);
      }
    });

    mindwaveConnection.on('end', function () {
      console.error('mindwave client disconnected');
    });

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
