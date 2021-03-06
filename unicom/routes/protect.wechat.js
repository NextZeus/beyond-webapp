var util = require('util');
var path = require('path');
var log4js = require('log4js');
var logger = log4js.getLogger(path.relative(process.cwd(),__filename));

exports = module.exports = function(app, models) {
	var _ = require('underscore');

	var add = function(req, res) {
		var doc = req.body;
		doc.menus = [];
		models.PlatformWeChat.create(doc, function(err) {
			if (err) return res.send(err);
			res.send({});
		});
	};
	var remove = function(req, res) {
		var id = req.params.id;
		models.PlatformWeChat.findByIdAndRemove(id, function(err, doc) {
			if (err) return res.send(err);
			res.send(doc);
		});
	};
	var update = function(req, res) {
		var id = req.params.id;
		var set = req.body;
		set = _.omit(set, 'menus');
		models.PlatformWeChat.findByIdAndUpdate(id, {
				$set: set
			}, {
				'upsert': false,
				'new': true,
			},
			function(err, doc) {
				if (err) return res.send(err);
				res.send(doc);
			}
		);
	};
	var getOne = function(req, res) {
		var id = req.params.id;
		models.PlatformWeChat
			.findById(id)
			.select({
				menus: 0
			})
			.exec(function(err, doc) {
				if (err) return res.send(err);
				res.send(doc);
			});
	};

	var getMore = function(req, res) {
		var action = req.query.action || '';
		var per = req.query.per || 20;
		var page = (!req.query.page || req.query.page < 0) ? 0 : req.query.page;
		page = (!page || page < 0) ? 0 : page;

		models.PlatformWeChat
			.find({})
			.select({
				menus: 0
			})
			.skip(per * page)
			.limit(per)
			.exec(function(err, docs) {
				if (err) return res.send(err);
				res.send(docs);
			});
	};

	/**
	 * router outline
	 */
	/**
	 * add protect/wechats
	 * action:
	 *     
	 */
	app.post('/protect/wechats', app.grant, add);
	/**
	 * update protect/wechats
	 * action:
	 *     
	 */
	app.put('/protect/wechats/:id', app.grant, update);

	/**
	 * delete protect/wechats
	 * action:
	 *     
	 */
	app.delete('/protect/wechats/:id', app.grant, remove);
	/**
	 * get protect/wechats
	 */
	app.get('/protect/wechats/:id', app.grant, getOne);

	/**
	 * get protect/wechats
	 * action:
	 *      action=category&category=xxx
	 */
	app.get('/protect/wechats', app.grant, getMore);
};