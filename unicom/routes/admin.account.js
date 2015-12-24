 exports = module.exports = function(app, models) {
 	var async = require('async');
 	var path = require('path');
 	var fs = require('fs');

 	var Account = models.Account;

 	var add = function(req, res) {
 		var account = req.body;
 		// role
 		var roles = account.role || [];
 		roles = _.omit(roles, '');
 		if(_.isEmpty(roles)) account = _.omit(account, 'role');
 		//set createby
 		account.createby = {
 			id: req.session.accountId,
 			username: req.session.username,
 			avatar: req.session.avatar, 
 		};

 		models.Account.create(account, function(err) {
 			if (err) return res.send(err);
 			res.send({});
 		});
 	};
	var remove = function(req,res){
 		var id = req.params.id;
 		models.Account.findOneAndRemove({
 						_id: accountId,
 						'createby.id': req.session.accountId,
 					},function(err,doc){
 			if(err) return res.send(err);
 			res.send(doc);
 		});
 	};

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
 				var new_path = path.join(__dirname, '../public/_tmp/', filename);
 				var avatar = '/_tmp/' + filename;
 				fs.rename(tmp_path, new_path, function(err) {
 					if (err) {
 						console.log(err);
 						return res.send(err);
 					}
 					Account.findOneAndUpdate(
 						{
 						_id: accountId,
 						'createby.id': req.session.accountId,
 					}, {
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
 				Account.findOneAndUpdate(
 					{
 						_id: accountId,
 						'createby.id': req.session.accountId,
 					}, {
 						$set: account,
 					}, {
 						'new': true,
 						'upsert': false,
 					},
 					function(err, doc) {
 						if (err) return res.send(err);
 						res.send(doc || {});
 					});
 				break;
 		}
 	};

 	var getOne = function(req, res) {
 		var accountId = req.params.id == 'me' ? req.session.accountId : req.params.id;
 		Account.findById(accountId)
 			.select({
 				password: 0,
 				histories: 0,
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
 						'createby.id': req.session.accountId,
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
 					.find({
 						$or: [{
	  						'createby.id': req.session.accountId,
 						},{
 							'roles': {
 								$in: ['channel']
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
 		}
 	}

 	/**
 	 * router outline
 	 */
 	/**
 	 * add admin/accounts
 	 *     
 	 */
 	app.post('/admin/accounts', add);
 	/**
 	 * update admin/accounts
 	 * type:
 	 *     avatar
 	 *     
 	 */
 	app.put('/admin/accounts/:id', update);

 	/**
 	 * delete admin/accounts
 	 *     
 	 */
 	app.delete('/admin/accounts/:id', remove);
	/**
 	 * get admin/accounts
 	 */
 	app.get('/admin/accounts/:id', getOne);

 	/**
 	 * get admin/accounts
 	 * type:
 	 *    search
 	 */
 	app.get('/admin/accounts', getMore);
 }