var log4js = require('log4js');
var util = require('util');
var fs = require('fs');
var http = require('http');
var path = require('path');
var express = require('express');
var session = require('express-session');
var mongoStore = require('connect-mongo')(session);
var bodyParser = require('body-parser');
var multer = require('multer'); 
var app = express();
var nodemailer = require('nodemailer');

log4js.configure(path.join(__dirname,'config/log4js.json'));
var logger = log4js.getLogger('server');
logger.setLevel('INFO');

//create an http server
app.server = http.createServer(app);
app.randomHex = function(){
	return new Date().getTime();
};

//import the data layer
var mongoose = require('mongoose');
var config = {
		server: require('./config/server'),
		mail: require('./config/mail'),
		db: require('./config/db')
	};		

//import the models
var models = {
		Account: require('./models/Account')(mongoose),
		AccountActivity: require('./models/AccountActivity')(mongoose),
		PlatformApp: require('./models/PlatformApp')(mongoose),
		PlatformFeature: require('./models/PlatformFeature')(mongoose),
		PlatformRole: require('./models/PlatformRole')(mongoose),
		ChannelCategory: require('./models/ChannelCategory')(mongoose),
		ChannelDepartment: require('./models/ChannelDepartment')(mongoose),
		ChannelGrid: require('./models/ChannelGrid')(mongoose),
		ChannelEntity: require('./models/ChannelEntity')(mongoose),
		ChannelCustomer: require('./models/ChannelCustomer')(mongoose),
		PageRecommend: require('./models/PageRecommend')(mongoose),
		PromoteProduct: require('./models/PromoteProduct')(mongoose),
		PromoteEvent: require('./models/PromoteEvent')(mongoose),
		PromoteMedia: require('./models/PromoteMedia')(mongoose),
		ProductCard: require('./models/ProductCard')(mongoose),
		OrderCard: require('./models/OrderCard')(mongoose),
		WoOrder: require('./models/WoOrder')(mongoose),
		WoRevenue: require('./models/WoRevenue')(mongoose),
		GoodsEntity: require('./models/GoodsEntity')(mongoose),
	};
	
mongoose.connect(config.db.URI,function onMongooseError(err){
	if(err) {
		logger.error('Error: can not open Mongodb.');
		throw err;
	}
});

//express configure
app.set('view engine', 'jade');
app.set('views', __dirname +'/views');

//show origin cookie
// app.use(function(req,res,next){
// 	logger.info('req.cookies:' + JSON.stringify(req.headers.cookie));
// 	next();
// });

app.use(express.static(__dirname + '/public'));
// app.use(express.limit('1mb'));
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(multer()); // for parsing multipart/form-data

//app session
app.sessionSecret = 'it is mime.';
app.sessionStore = new mongoStore({
			url: config.db.URI,
			collection: 'sessions'
		});
app.use(session({
		secret: app.sessionSecret,
		key: 'beyond.sid',
		store: app.sessionStore,
		saveUninitialized: false,
        resave: true
    }));

app.get('/', function(req,res){
	res.render('index.jade',{layout: false});
});

// app.get('/download/:name', function(req,res){
// 	var filename = req.params.name;
// 	if(!fs.existsSync(path.join(__dirname,'public/downloads',filename))){
// 		res.sendStatus(404);
// 		return;
// 	}
// 	var file = path.join(__dirname,'public/downloads',filename);
// 	res.download(file);
// });

//授权判断中间件
app.grant = function(req,res,next){
	logger.debug('req.path: ' + util.inspect(req.path));
	logger.debug('req.params.id: ' + util.inspect(req.params.id));
	logger.debug('req.method: ' + req.method);
	var path = req.path;
	if((req.method == 'PUT' || 
		req.method == 'DELETE' ||
		req.method == 'GET') && req.params.id){		
		var id = path.lastIndexOf('/');
		logger.debug(id);
		if(id != -1) path = path.slice(0, id);
		logger.debug(path);
	}
	var regexp_path = new RegExp(path,'i');
	logger.debug(regexp_path);
	if(regexp_path.test(req.session.grant)) return next();
	return res.status(401).end();
};

//设置跨域访问
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost:8000");
    res.header("Access-Control-Allow-Credentials","true");
    res.header("Access-Control-Allow-Headers", "X-Requested-With,Content-Type,Set-Cookie");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1')
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});

//import the routes
fs.readdirSync(path.join(__dirname, 'routes')).forEach(function(file){
	// var routeName = file.substr(0,file.indexOf('.'));
	var routeName = file.substr(0,file.length-3);
	require('./routes/' + routeName)(app,models);
});

app.server.listen(config.server.PORT,function(){
	logger.info(config.server.NAME + ' App is running at '+ config.server.PORT + ' now.');
});