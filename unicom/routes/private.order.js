 exports = module.exports = function(app, models) {

 	var getOne = function(req, res) {
 		var id = req.params.id;
 		models.Order
 			.findById({
 				_id: id,
 				'createBy.id': req.session.accountId, //** 只能看自己的 			 				
 			})
 			.exec(function(err, doc) {
 				if (err) return res.send(err);
 				res.send(doc);
 			});
 	};
 	var getMore = function(req, res) {
 		var per = 20;
 		var page = (!req.query.page || req.query.page < 0) ? 0 : req.query.page;
 		page = (!page || page < 0) ? 0 : page;

 		models.Order
 			.find({
 				'createBy.id': req.session.accountId, //** 只能看自己的 
 				'status': {//** 仅显示成功和失败的订单
 					$in: ['成功','失败']
 				}, 			 				
 			})
 			.sort({_id: -1})
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
 	 * get private/orders
 	 */
 	app.get('/private/orders/:id', app.isLogin, getOne);

 	/**
 	 * get private/orders
 	 * type:
 	 */
 	app.get('/private/orders', app.isLogin, getMore);
 };