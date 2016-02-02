var util         = require('util');
var EventEmitter = require('events').EventEmitter;
var thinkgear = require('node-thinkgear-sockets');
var _            = require('lodash');
var debug        = require('debug')('meshblu-mindwave');

var client = thinkgear.createClient({ enableRawOutput: true });
var connected = false;

var MESSAGE_SCHEMA = {};

var OPTIONS_SCHEMA = {
  type: 'object',
  properties: {
    broadcastInterval : {
      type : 'number',
      required : true,
      default : 100
    }
  }
};

var DEFAULT_OPTIONS = {
  broadcastInterval: 100
};

function Plugin(){
  self = this;
  self.options = DEFAULT_OPTIONS;
  self.messageSchema = MESSAGE_SCHEMA;
  self.optionsSchema = OPTIONS_SCHEMA;
  return self;
}
util.inherits(Plugin, EventEmitter);

Plugin.prototype.onMessage = function(message){
  var payload = message.payload;
};

Plugin.prototype.onConfig = function(device){
  var self = this;
  self.setOptions(device.options||DEFAULT_OPTIONS);
};

Plugin.prototype.setOptions = function(options){
  debug('setting options', options);
  var self = this;
  self.options = options;

  if(!connected){
    debug('connected to mindwave');
    var throttledEmit = _.throttle(function(payload){
      self.emit('message', payload);
      console.log(payload);
    }, self.options.broadcastInterval || 100);

    client.on('data', function (result) {
      var data = {
        devices : '*',
        payload : result
      };
      throttledEmit(data);
    });

    client.on('blink_data', function (result) {
      var data = {
        devices : '*',
        payload : result
      };
      throttledEmit(data);
    });

    self.getMindwaveConnection();

    client.on('end', function () {
      connected = false;
      console.error('mindwave client disconnected');
    });
  }
};

Plugin.prototype.getMindwaveConnection = function(){
  if(!connected){
    client.connect();
    connected = true;
  }
};


module.exports = {
  options: DEFAULT_OPTIONS,
  messageSchema: MESSAGE_SCHEMA,
  optionsSchema: OPTIONS_SCHEMA,
  Plugin: Plugin
};
