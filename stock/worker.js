var debug = true;
var log4js = require('log4js');
var _ = require('underscore');
var async = require('async');
var fs = require('fs');
var path = require('path');
var cst = require('./config/constant');
var trading = require('./libs/trading');
var citic = require('./libs/citic');

log4js.configure(path.join(__dirname,'log4js.json'));
var logger = log4js.getLogger('worker');
logger.setLevel('DEBUG');

var status = {
	platform: false,
	trade: false,
};

var intervalObject;

var mongoose = require('mongoose');
var config = {
	mail: require('./config/mail'),
	db: require('./config/db')
};
//** import the models
var models = {
	StockQuote: require('./models/StockQuote')(mongoose),
	Trading: require('./models/Trading')(mongoose),
	Strategy: require('./models/Strategy')(mongoose),
};

trading.on('quote', function(stock) {
	logger.info('quote: ' + JSON.stringify(stock.symbol));
	if(stock.price != '0.00'){
		models.StockQuote
			.findOneAndUpdate({
					'symbol': stock.symbol,
					'date': stock.date,
					'time': stock.time,
				}, {
					$set: stock
				}, {
					upsert: true
				},
				function(err, doc) {
					if (err) return logger.error(err);
				}
			);		
	}
});

trading.on('buy', function(trade) {
	trade = trade || {};
	var stock = trade.stock;
	var transaction = trade.transaction;
	logger.info('buy transaction: ' + JSON.stringify(transaction));

	async.waterfall(
		[
			function pushTransaction(callback) {
				models.Strategy
					.findOneAndUpdate({
							'symbol': stock.symbol
						}, {
							$push: {
								'transactions': {
									price: transaction.price,
									quantity: transaction.quantity,
									direction: transaction.direction
								}
							},
							$inc: {
								'times': 1
							}
						}, {
							upsert: false,
						},
						function(err, result) {
							if (err) return callback(err);
							callback(null);
						}
					);
			},
			function saveTrading(callback) {
				var newTrade = {
						symbol: stock.symbol,
						stock: stock.stock,
						price: transaction.price,
						quantity: transaction.quantity,
						direction: transaction.direction,
						status: {
							code: -1,
							message: '未成交',
						},
						tax: 0,
						date: stock.date,
						time: stock.time,
					};
				models.Trading.create(newTrade, function(err, doc) {
					if (err) return callback(err);
					callback(null);
				});
			},
		],
		function(err, result) {
			if (err) return logger.error(err);
		}
	);

});

trading.on('sell', function(trade) {
	trade = trade || {};
	var stock = trade.stock;
	var transaction = trade.transaction;
	logger.info('sell transaction: ' + JSON.stringify(transaction));
	async.waterfall(
		[
			function pushTransaction(callback) {
				models.Strategy
					.findOneAndUpdate({
							'symbol': stock.symbol
						}, {
							$push: {
								transactions: {
									price: transaction.price,
									quantity: transaction.quantity,
									direction: transaction.direction
								}
							},
							$inc: {
								'times': 1
							}
						}, {
							upsert: false,
						},
						function(err, result) {
							if (err) return callback(err);
							callback(null);
						}
					);
			},
			function saveTrading(callback) {
				var newTrade = {
						symbol: stock.symbol,
						stock: stock.stock,
						price: transaction.price,
						quantity: transaction.quantity,
						direction: transaction.direction,
						status: {
							code: -1,
							message: '未成交',
						},
						tax: 0,
						date: stock.date,
						time: stock.time,
					};
				models.Trading.create(newTrade, function(err, doc) {
					if (err) return callback(err);
					callback(null);
				});
			},
		],
		function(err, result) {
			if (err) return logger.error(err);
		}
	);
});

var getStatus = function(){
	logger.info('collect status.');
	process.send && process.send(status);
};

var start = function() {
	if(status.platform) return;
	logger.info('worker start.');
	mongoose.connect(config.db.URI, function onMongooseError(err) {
		if (err) {
			logger.error('Error: can not open Mongodb.');
			throw err;
		}
	});
	var lastTimestamp = Date.now();
	var interval = 5000;
	intervalObject = setInterval(function() {
		logger.debug('interval: ' + interval);
		models.Strategy
			.find({
				'status.code': 1
			})
			.exec(function(err, strategies) {
				if (err) return logger.error(err);
				if (_.isEmpty(strategies)) return logger.warn('没有可执行的。');
				trading.run(strategies, function(err, result) {
					if (err) return logger.error(err);
					var now = Date.now();
					interval = now - lastTimestamp;
					if (interval < 1) {
						interval = 1;
						logger.warn('执行时间太长，应调节间隔');
					}
					lastTimestamp = now;
				});
			});
	}, interval);
	status.platform = true;
	process.send && process.send(status);
};

var stop = function() {
	if(!status.platform) return;
	logger.info('worker stop.');
	intervalObject && clearInterval(intervalObject);
	mongoose.disconnect();
	status.platform = false;
	process.send && process.send(status);
};

var startTrade = function(){
	if(status.trade) return;
	logger.info('trade start.');
	status.trade = true;
	process.send && process.send(status);
};

var stopTrade = function(){
	if(!status.trade) return;
	logger.info('trade stop.');
	status.trade = false;
	process.send && process.send(status);
};

var keepAlive = function() {
	return setInterval(function() {
		process.send({});
	}, 5000);
};

var captcha = function(options){
	logger.info(options);
};
/**
 * client process
 * @param  {[type]} msg) {	msg        message Object
 * @return {[type]}      [description]
 */

process.on('SIGTERM', function() {
	logger.info('Worker Got a SIGTERM, exiting...');
	process.exit(1);
});

process.on('message', function(msg) {
	msg = msg || {};
	var command = msg.command || '';
	switch (command) {
		case 'status': 
			getStatus();
			break;
		case 'start':
			// keepAlive();
			start();
			break;
		case 'stop':
			stop();
			break;
		case 'startTrade':
			startTrade();
			break;
		case 'stopTrade':
			stopTrade();
			break;
		case 'captcha':
			captcha(msg);
			break;	
		default:
			break;
	}
});

process.on('exit', function() {
	//ONLY accept synchronous operations
	logger.info('exit');
});

process.on('error', function(err) {
	logger.error('error.');
	process.exit(1);
});

//dev
if (process.argv.length == 3) {
	start();
	setTimeout(function() {
		stop();
	}, 10000);
}