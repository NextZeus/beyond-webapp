 exports = module.exports = function(app, models) {
 	var async = require('async');
 	var path = require('path');
 	var fs = require('fs');

 	var Account = models.Account;

 	var update = function(req, res) {
 		var accountId = req.params.id == 'me' ? req.session.accountId : req.params.id;
 		var type = req.query.type || '';
 		var account = req.body;
 		switch (type) {
 			case 'avatar':
 				// console.log(req.files);
 				// res.writeHead(200, {'content-type': 'text/plain'});
 				// res.write('received upload:\n\n');
 				// var util = require('util');
 				// res.end(util.inspect({files: req.files}));
 				var file = req.files.files;
 				var filename = app.randomHex() + '.' + file.extension; //file.name;
 				var tmp_path = file.path;
 				var new_path = path.join(__dirname, '../public/upload/', filename);
 				var avatar = '/upload/' + filename;
 				fs.rename(tmp_path, new_path, function(err) {
 					if (err) {
 						console.log(err);
 						return res.send(err);
 					}
 					Account.findByIdAndUpdate(
 						accountId, {
 							$set: {
 								avatar: avatar
 							}
 						}, {
 							'new': true,
 							'upsert': false,
 						},
 						function(err, doc) {
 							if (err) return res.send(err);
 							res.send({
 								src: avatar
 							});
 						}
 					);
 				});
 				break;
 			default:
 				Account.findByIdAndUpdate(
 					accountId, {
 						$set: account,
 					}, {
 						'new': true,
 						'upsert': false,
 					},
 					function(err, doc) {
 						if (err) return res.send(err);
 						res.send(doc);
 					});
 				break;
 		}
 	};

 	var getOne = function(req, res) {
 		var accountId = req.params.id == 'me' ? req.session.accountId : req.params.id;
 		Account.findById(accountId)
 			.select({
 				password: 0
 			})
 			.exec(function(err, doc) {
 				if (err) return res.send(err);
 				res.send(doc);
 			});
 	};

 	var getMore = function(req, res) {
 		var type = req.query.type || '';
 		var accountId = req.params.id == 'me' ? req.session.accountId : req.params.id;
 		var page = (!req.query.page || req.query.page < 0) ? 0 : req.query.page;
 		page = (!page || page < 0) ? 0 : page;
 		var per = 20;

 		switch (type) {
 			case 'search':
 				var searchStr = req.query.searchStr || '';
 				var searchRegex = new RegExp(searchStr, 'i');
 				Account.find({
 						$or: [{
 							'username': {
 								$regex: searchRegex
 							}
 						}, {
 							'email': {
 								$regex: searchRegex
 							}
 						}]
 					})
 					.skip(per * page)
 					.limit(per)
 					.exec(function(err, docs) {
 						if (err) return res.send(err);
 						res.send(docs);
 					});
 				break;
 			default:
 				Account
 					.find({})
 					.skip(per * page)
 					.limit(per)
 					.exec(function(err, docs) {
 						if (err) return res.send(err);
 						res.send(docs);
 					});
 				break;
 		}
 	}

 	/**
 	 * router outline
 	 */
 	/**
 	 * update account
 	 * type:
 	 *     avatar
 	 *     
 	 */
 	app.put('/accounts/:id', app.isLogined, update);

 	/**
 	 * get account
 	 */
 	app.get('/accounts/:id', app.isLogined, getOne);

 	/**
 	 * get accounts
 	 * type:
 	 *    search
 	 */
 	app.get('/accounts', app.isLogined, getMore);
 }