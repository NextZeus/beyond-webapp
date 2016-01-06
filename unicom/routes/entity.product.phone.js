var util = require('util');
var log4js = require('log4js');
var logger = log4js.getLogger('route:entity.product.phone');
logger.setLevel('INFO');

exports = module.exports = function(app, models) {
	var _ = require('underscore');

	var add = function(req, res) {
		var doc = req.body;
		doc.packages = [];
		models.ProductPhone.create(doc,function(err) {
			if (err) return res.send(err);
			res.send({});
		});
	};
	var remove = function(req, res) {
		var id = req.params.id;
		models.ProductPhone.findByIdAndRemove(id, function(err, doc) {
			if (err) return res.send(err);
			res.send(doc);
		});
	};
	var update = function(req, res) {
		var id = req.params.id;
		var action = req.body.action || '';
		switch (action) {
			case 'addpackage':
				models.ProductPhone.findByIdAndUpdate(id, {
						$push: {
							'packages': req.body.package
						}
					}, {
						'upsert': false,
						'new': true,
					},
					function(err, doc) {
						if (err) return res.send(err);
						res.send(doc);
					}
				);
				break;
			case 'removepackage':
				models.ProductPhone.findByIdAndUpdate(id, {
						$pull: {
							'packages': {
								_id: req.body.id
							},
						}
					}, {
						'upsert': false,
						'new': true,
					},
					function(err, doc) {
						if (err) return res.send(err);
						res.send(doc);
					}
				);
				break;
			default:
				var set = req.body;
				set = _.omit(set,'packages');
				models.ProductPhone.findByIdAndUpdate(id, {
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
				break;
		}
	};
	var getOne = function(req, res) {
		var id = req.params.id;
		models.ProductPhone
			.findById(id)
			.exec(function(err, doc) {
				if (err) return res.send(err);
				res.send(doc);
			});
	};
	var getMore = function(req, res) {
		var type = req.query.type || '';
		var per = req.query.per || 20;
		var page = (!req.query.page || req.query.page < 0) ? 0 : req.query.page;
		page = (!page || page < 0) ? 0 : page;
		switch (type) {
			case 'category':
				models.ProductPhone
					.find({
						category: req.query.category,
						status: '有效',
					})
					.skip(per * page)
					.limit(per)
					.exec(function(err, docs) {
						if (err) return res.send(err);
						res.send(docs);
					});
				break;
			default:
				models.ProductPhone
					.find({})
					.skip(per * page)
					.limit(per)
					.exec(function(err, docs) {
						if (err) return res.send(err);
						res.send(docs);
					});
		}
	};
	/**
	 * router outline
	 */
	/**
	 * add product/phones
	 * type:
	 *     
	 */
	app.post('/product/phones', add);
	/**
	 * update product/phones
	 * type:
	 *     
	 */
	app.put('/product/phones/:id', update);

	/**
	 * delete product/phones
	 * type:
	 *     
	 */
	app.delete('/product/phones/:id', remove);
	/**
	 * get product/phones
	 */
	app.get('/product/phones/:id', getOne);

	/**
	 * get product/phones
	 * type:
	 *      type=category&category=xxx
	 */
	app.get('/product/phones', getMore);
};