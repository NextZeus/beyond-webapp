var content1 ='test';
var content = '一线：北京周边景点：周村、小故宫、九如山瀑布、红叶大峡谷，大三日，' +
  '时间为6月28日--30日（周四--周六），其中两日为年休假时间。' +
  '二线：草原/海边：在承德木兰围场或坝上草原或日照择一，暂时未定，预计时间在8月份。' +
  '如有家属参加请注明，以便协调旅行社。' +
  '-- 李X';

var config = require('../../../config/sp').SGIP12;
var net = require('net');
var CommandFactory = require('../lib/commands');
var Bind = CommandFactory.create('Bind');
var Unbind = CommandFactory.create('Unbind');
var Submit = CommandFactory.create('Submit');
var handler = require('../lib/handler');

var client = net.connect({
  host: 'localhost', //config.SPHost,
  port: 8124, //config.SPPort,
}, function() {
  console.log('client connected.');
  //** send Bind Command
  var bind = new Bind(1, config.SPUser, config.SPPass);
  client.write(bind.makePDU());
});

client.on('bind_resp', function() {
  //** send Submit
  var submit = new Submit(config.TestMobile, 8, content);
  client.write(submit.makePDU());
});

client.on('submit_resp', function(response) {
  //** send Unbind
  var unbind = new Unbind();
  client.write(unbind.makePDU());
});

client.on('unbind_resp', function() {
  client.end();
});

client.on('response', function(buf) {
  var response = CommandFactory.parse(buf);
  console.log(response);
  if (response instanceof Bind.Resp) {
    if (response.Result != 0) {
      return client.end();
    }
    client.emit('bind_resp');
  } else if (response instanceof Unbind.Resp) {
    client.emit('unbind_resp');

  } else if (response instanceof Submit.Resp) {
    client.emit('submit_resp', buf);
  }
});

client.on('data', handler(client));