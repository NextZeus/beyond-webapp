exports = module.exports = function(app, models) {

	var getOne = function(req,res){
		models.Strategy.findById(req.params.id, function(err,doc){
			if(err) return res.send(err);
			res.send(doc);
		});
	};

	var getMore = function(req, res) {
		var per = 20;
		var type = req.query.type || '';
		var page = req.query.page || 0;
		page = (!page || page < 0) ? 0 : page;
		var query = {};
		switch (type) {
			case 'graph': 
				var now = new Date();
				var symbol = req.query.symbol
				var from = new Date(req.query.from || 0);
				var to = new Date(req.query.to || now);
				query = {
					'symbol': symbol,
					'lastupdatetime': {
						$gte: from,
						$lt: to
					}
				};
				models.Strategy
					.find(query)
					.sort({
						_id: 1
					})
					.exec(function(err, docs) {
						if (err) return res.send(err);
						res.send(docs);
					});
				break;
			case 'search':
				var now = new Date();
				var from = new Date(req.query.from || 0);
				var to = new Date(req.query.to || now);
				var searchStr = req.query.searchStr || '';
				var searchRegex = new RegExp(searchStr, 'i');
				query = {
					lastupdatetime: {
						$gte: from,
						$lt: to
					},
					$or: [{
						'symbol': {
							$regex: searchRegex
						}
					}, {
						'status.message': {
							$regex: searchRegex
						}
					}]
				};
				models.Strategy
					.find(query)
					.sort({
						_id: -1
					})
					.skip(per * page)
					.limit(per)
					.exec(function(err, docs) {
						if (err) return res.send(err);
						res.send(docs);
					});
				break;
			default:
				query = {};
				models.Strategy
					.find(query)
					.select({transactions: 0})
					.sort({
						_id: -1
					})
					.skip(per * page)
					.limit(per)
					.exec(function(err, docs) {
						if (err) return res.send(err);
						res.send(docs);
					});
				break;
		}
	};

	/**
	 * router outline
	 */

	/**
	 * get one
	 * 
	 */
	app.get('/strategy/:id', getOne);

	/**
	 * get more
	 *   type: graph
	 *      params:
	 *         symbol: stock symbol
	 *   type: search
	 *      params: 
	 *         searchStr: search string, '600218'
	 *         from: date begin, i.e. 2015-01-01
	 *         to: date end
	 */
	app.get('/strategy', getMore);
};