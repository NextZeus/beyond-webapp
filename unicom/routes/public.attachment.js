var iconv = require('iconv-lite');
exports =module.exports = function(app,models){
	var path = require('path');
	var fs = require('fs');

	var add = function(req,res){
			// console.log(req.files);
			// res.writeHead(200, {'content-type': 'text/plain'});
			// res.write('received upload:\n\n');
			// var util = require('util');
			// res.end(util.inspect({files: req.files}));
			var file = req.files.files;
			var filename = app.randomHex() + '.' + file.extension;//file.name;
			var tmp_path = file.path;
			var new_path = path.join(__dirname, '../public/_images/',filename);
			var attachment = '/_images/' + filename;
			if(file.extension == 'csv'){
 				//** 导入和转化csv
				var reader = fs.createReadStream(tmp_path,{encoding: null});
				var writer = fs.createWriteStream(new_path, {encoding: 'utf8'});
				reader
					.pipe(iconv.decodeStream('GBK'))
					.pipe(iconv.encodeStream('utf8'))
					.pipe(writer);
				file.name = filename;
				file.url = attachment;
				res.send(file);
			}else{
				fs.rename(tmp_path,new_path,function(err){
					if(err) console.error(err);
					if(err) return res.send({code: 40000, errmsg: 'upload error.'});
					file.name = filename;
					file.url = attachment;
					res.send(file);
				});
			}
		};

	var remove = function(req,res){
			var filename = req.body.filename || '';
			var file_path = path.join(__dirname, '../public/',filename);
			fs.unlink(file_path,function(err){
				if(err) console.error(err);
				if(err) return res.send({code: 40100, errmsg: 'delete file error.'});
				
				res.sendStatus(200);
			});
		};

/**
 * router outline
 */

 	/**
 	 * add an attachment
 	 */
 	app.post('/public/attachments', app.isLogin, add);
 	/**
 	 * remove an attachment
 	 */
 	app.delete('/public/attachments', app.isLogin, remove);
};