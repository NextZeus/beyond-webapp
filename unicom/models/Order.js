var mongoose = require('mongoose');
var mongooseToCsv = require('mongoose-to-csv');
var CSV = require('comma-separated-values');
var async = require('async');
var path = require('path');
var utils = require('../libs/utils');
//** SP配置文件
var spConfig = require('../config/sp').SGIP12;
var _ = require('underscore');
var async = require('async');
var BSS = require('../libs/bss_gz');//** 贵州联通BSS系统
var CBSS = require('../libs/cbss');//** 联通CBSS系统
var logger = require('log4js').getLogger(path.relative(process.cwd(), __filename));
var regexp = require('../libs/regexp');

var schema = new mongoose.Schema({
	customer: { //** 客户
		mobile: String, //** 客户手机号
		id: String, //** 客户Id(customer._id)
		name: String, //** 客户姓名
		idNo: String, //** 客户身份证号码
		idType: String, //** 客户身份证类型
		idAddress: String, //** 客户身份证地址
		address: String, //** 客户通讯地址
		phone: String, //** 客户备用联系电话
		location: String, //** 客户地理位置
	},
	goods: { //** 产品
		name: String, //** 产品名称(goods.name)
		id: String, //** 产品id(goods._id)
		category: String, //** 产品分类(goods.category)
		barcode: String, //** 产品编码(goods.barcode)
		smscode: String, //** 业务(SMS)编码(goods.smscode)
		price: Number, //** 产品单价(product.price)
		unit: String, //** 产品单位(product.unit)
		bonus: Number, //** 单个产品佣金
	},
	effect: { //** 生效方式
		type: String,
		enum: {
			values: '次月生效|立即生效'.split('|'),
			message: 'enum validator failed for path {PATH} with value {VALUE}',
		}
	},
	thumbnail: String, //** 商品图标
	quantity: { //** 商品数量(product.quantity)
		type: Number,
		default: 0,
	},
	total: { //** 订单总价
		type: Number,
		default: 0,
	},
	bonus: { //** 订单佣金
		type: Number,
		default: 0,
	},
	createBy: { //** 订单创建者
		id: String,
		username: String,
		mobile: String,
		avatar: String,
	},
	department: {
		id: String,
		name: String, //** 营业厅名称
		city: String, //** 城市名称
		grid: String, //** 网格编码
		district: String, //** 地区编码			
	},
	confirmCode: Number, //** 短信上行确认验证码
	status: { //** 订单状态
		type: String,
		enum: {
			values: '新建|已确认|已处理|成功|失败'.split('|'),
			message: 'enum validator failed for path {PATH} with value {VALUE}',
		}
	},
	histories: [], //** 订单修改记录
	lastupdatetime: {
		type: Date,
		default: Date.now
	},
});

schema.post('save', function(){
	//** 如果是4G业务，则需要在CbssOrder中添加一条记录
});

schema.set('collection', 'orders');

//** 导出csv
schema.plugin(mongooseToCsv, {
	headers: '客户号码 产品名称 产品类别 产品编码 产品价格 推荐人姓名 推荐人号码 推荐人佣金 渠道名称 所在城市 所在地区 所在网格 发生时间 订单状态',
	constraints: {
		'订单状态': 'status',
	},
	virtuals: {
		'客户号码': function(doc){
			return doc.customer.mobile;
		},
		'产品名称': function(doc){
			return doc.goods.name;
		},
		'产品编码': function(doc){
			return doc.goods.barcode;
		},
		'产品类别': function(doc){
			return doc.goods.category;
		},
		'产品价格': function(doc){
			return doc.goods.price;
		},
		'推荐人姓名': function(doc){
			return doc.createBy.username;
		},
		'推荐人号码': function(doc){
			return doc.createBy.mobile;
		},
		'推荐人佣金': function(doc){
			return doc.goods.bonus;
		},
		'渠道名称': function(doc){
			return doc.department.name;
		},
		'所在城市': function(doc){
			return doc.department.city;
		},
		'所在地区': function(doc){
			return doc.department.district;
		},
		'所在网格': function(doc){
			return doc.department.grid;
		},
		'发生时间': function(doc){
			var date = doc.lastupdatetime;
			return utils.dateFormat(date, 'yyyyMMddhhmmss');
		}
	}
});

module.exports = exports = function(connection){
	connection = connection || mongoose;

	/**
	 * 新增订单
	 * @param {[type]}   options [description]
	 * @param {Function} done    [description]
	 */
	schema.statics.add = function(options,done){
		var action = options.action || 'order';  //** 两种行为：recommend or order 发送短信对象不同
		var product = options.product;
		var mobiles = options.mobiles;
		var effect = options.effect;
		var account = options.account;

		var ProductDirect = connection.model('ProductDirect');
		var Order = connection.model('Order');
		var PlatformSms = connection.model('PlatformSms');
		var AccountActivity = connection.model('AccountActivity');
		//** 按单个手机执行
		async.each(
			mobiles,
			function(mobile,done){
				async.waterfall(
					[
						function getProduct(callback) {
							ProductDirect
								.findById(product._id)
								.exec(function(err, prod){
									if(err || !prod) return callback(err);
									var goods = prod.goods || {};
									goods.unit = goods.unit || prod.unit || '';
									var order = {
											customer: {
												mobile: mobile,
											},
											goods: goods,
											effect: effect,
											thumbnail: prod.thumbnail_url,
											quantity: 1,
											total: goods.price, 
											bonus: goods.bonus, 
											createBy: {//** 创建订单的用户
												id: account.accountId,
												username: account.username,
												mobile: account.email,
												avatar: account.avatar,
											},
											department: account.department,//** 创建订单的用户营业厅
											status: '新建',
											confirmCode: _.random(1000,9999),//** 创建随机验证码
										};
									callback(null,order);
								});
						},
						function createOrder(order,callback) {
							//** 查找3分钟内是否有类似订单，否则不创建
							var lastOrderDate = new Date(Date.now()-180000);
							Order
								.findOne({
									'customer.mobile': order.customer.mobile,
									'goods.barcode': order.goods.barcode,
									'lastupdatetime': {
										'$gt': lastOrderDate
									},
								})
								.exec(function(err,existOrder){
									if(err) return callback(err);
									//** 在3分钟内存在订单，则返回错误
									if(existOrder){
										return callback({code: 405123, errmsg: '同一客户、同一产品重复下单时间间隔不得小于3分钟'});
									}
									Order.create(order, function(err){
										if(err) return callback(err);
										callback(null,order);
									});
								});
						},
						function createSms(order,callback){
							var sms = {};
							//** sms业务代码部分
							if(action == 'recommend'){
								//** 推荐模式
								sms.sender = String(order.goods && order.goods.smscode).replace(/\D/g,''); 
								sms.receiver = order.customer.mobile;
								sms.content = '尊敬的用户您好，欢迎订购(' + order.goods.name + ')，资费:(' + order.goods.price + ' ' + order.goods.unit +')，回复“Y”确认订购(10分钟内有效)。';
								sms.status = '新建';
								PlatformSms
									.create(sms, function(err){
										if(err) return callback(err);
										callback(null);
									});
							}else if(action == 'order'){
								//** 订购模式
								if(/1\d{10}/.test(order.createBy.mobile)){
									sms.sender = String(order.goods && order.goods.smscode).replace(/\D/g,''); 
									sms.receiver = order.createBy.mobile || '';
									sms.content = '您(' + (order.createBy.mobile || '') + ')为 ' + order.customer.mobile + ' 用户申请订购(' + order.goods.name + ')，资费:(' + order.goods.price + ' ' + order.goods.unit +')，回复验证码确认订购(10分钟内有效): '+ order.confirmCode +'。';
									sms.status = '新建';
									PlatformSms
										.create(sms, function(err){
											if(err) return callback(err);
											callback(null);
										});
								}else{
									callback(null);
								}
							}
						},
						function createActivity(callback) {
							var body = '';
							if(action == 'recommend'){
								body = '向朋友推荐了<u>' + product.name + '</u>产品';
							}else{
								body = '向帮助朋友订购了<u>' + product.name + '</u>产品';
							}
							var activity = {
								uid: account.accountId,
								username: account.username,
								avatar: account.avatar || '/images/avatar.jpg',
								type: 'text',
								content: {
									body: body,
								}
							};
							AccountActivity
								.create(activity, callback);
						}
					],
					function(err, result) {
						if (err) return done(err);
						done(null);
					});
			},
			done
		);
	};
	
	/**
	 * 处理2G/3G订单
	 * SMS状态：由收到 转化为 已处理
	 * Order状态：由新建 转化为 已处理
	 * @param {Function} callback [description]
	 */
	schema.statics.process2G_3G = function(options,done){
		if(arguments.length < 1) throw new Error('参数不足：function(options,done)');
		if(options instanceof Function) {
			done = options;
			options = {};
		}
		//** 取出2G_3G程序可处理的城市名称集合，仅处理这些城市的订单
		var cities = BSS.getAccountCities();
		var cityRegex = new RegExp('(' + cities.join('|') + ')');

		var SPNumber = options.SPNumber || spConfig.options.SPNumber;
		var PlatformSms = connection.model('PlatformSms');
		var Order = connection.model('Order');
		var _process = function(){
				//** find the order
				Order
					.findOneAndUpdate({
						'goods.category': {
							$in: ['2G','3G']
						},
						'department.city': {
							$regex: cityRegex,
						},
						'status': '已确认',
					}, {
						$set: {
							status: '已处理',
						}
					}, {
						'upsert': false,
						'new': true,
					}, function(err, order) {
						if (err || !order) return done(err);
						//** 没有设置城市，则默认不能订购，或者取贵阳??
						var city = (order.department && order.department.city) || '未知';
						//** process 2G/3G order
						// var bssAccount = BSS.getAccountByCity('测试'); //** 测试账号
						var bssAccount = BSS.getAccountByCity(city); //** 按城市取
						//** 如果没设置城市
						if(!bssAccount.StaffID){
							//** 将状态改为“失败”
							var result = result || {};
							var RespCode = '88';
							var RespDesc = '营业员未设置城市，无法下订单';
							var EffectTime = '';
							Order.findByIdAndUpdate(
								order._id,
								{
									$set: {
										status: '失败'
									},
									$push: {
										'histories':  {
											respCode: RespCode,
											respDesc: RespDesc,
											effectTime: EffectTime,
											respTime: new Date(),
										}
									}
								}, {
									'upsert': false,
									'new': true,
								}, function(err){
									if(err) return done(err);
									//** 给营业员发送业务“处理失败”短信
									var sms = {};
									//** sms业务代码部分
									var mobile = order.createBy.mobile || '';
									//** 不是有效的手机号码
									if(!/^\d+$/.test(mobile)){
										//** 处理下一个
										return _process();										
									}
									sms.sender = String(order.goods && order.goods.smscode).replace(/\D/g,''); 
									sms.receiver = mobile;
									sms.content = '您的账号渠道信息设置不正确(未设置城市)，请联系沃助手客服人员解决后再使用。';
									sms.status = '新建';
									PlatformSms
										.create(sms, function(err){
											if(err) return done(err);
											//** 处理下一个
											_process();
										});
								});
						}else{
							//** 正常，下订单
							BSS.addOrder({
								// url: BSS.getBssUrl('test'), //** 测试地址
								url: BSS.getBssUrl('prod'), //** 生产地址
								requestId: String(order._id),//** 请求Id
								ProductId: order.goods.barcode, //** 物料编码
								StaffID: bssAccount.StaffID,//** 工号
								DepartID: bssAccount.DepartID, //** 渠道代码
								UserNumber: order.customer.mobile, //** 客户手机号码
							},function(err, result){
								//** BSS 接口返回错误
								if(err) console.log(err);
								//** 将状态改为“成功”或“失败”
								result = result || {};
								var RespCode = result.RespCode || '88';
								var RespDesc = result.RespDesc || '未知错误';
								var EffectTime = result.EffectTime || '';
								var status = /^00/.test(RespCode) ? '成功' : '失败';
								Order.findByIdAndUpdate(
									order._id,
									{
										$set: {
											status: status
										},
										$push: {
											'histories':  {
												respCode: RespCode,
												respDesc: RespDesc,
												effectTime: EffectTime,
												respTime: new Date(),
											}
										}
									}, {
										'upsert': false,
										'new': true,
									}, function(err){
										if(err) return done(err);
										//** 发送业务“处理成功”或“处理失败短信”短信
										//** 尊敬的用户您好，您订购的（产品名称）系统已受理，请耐心等待，订购结果将短信告知。
										var sms = {};
										//** sms业务代码部分
										sms.sender = String(order.goods && order.goods.smscode).replace(/\D/g,''); 
										sms.status = '新建';
										if(status == '成功'){
											sms.receiver = order.customer.mobile;
											sms.content = '恭喜您，您订购的(' + order.goods.name + ')已订购成功。' ;
											PlatformSms
												.create(sms, function(err){
													if(err) return done(err);
													//** 处理下一个
													_process();
												});
										}else{
											sms.content = '(' + order.goods.name + ')订购失败，详情请咨询10010，或到就近营业厅咨询办理。';
											//** 处理下一个
											_process();
										}
									});
							});
						}
					});
			};
		//** 启动第一个
		_process();
	};
	/**
	 * 2G/3G 订单确认检查
	 * Order状态：由已处理转化为成功或失败
	 * @param {Function} callback [description]
	 */
	schema.statics.confirm2G_3G = function(options,done){
		if(arguments.length < 1) throw new Error('参数不足：function(options,done)');
		if(options instanceof Function) {
			done = options;
			options = {};
		}
		var Order = connection.model('Order');
		var _confirm = function() {
				Order
					.findOne({
						'goods.category': {
							$in: ['2G','3G']
						},
						status: '已处理',
					})
					.exec(function(err, order) {
						if (err) return done(err);
						if (!order) return done(null);
						//** check 2G/3G order
						var status = success ? '失败' : '成功';

						Order
							.findByIdAndUpdate(order._id, {
									$set: {
										status: status,
									}
								}, {
									'upsert': false,
									'new': true,
								},
								function(err, doc) {
									if (err || !doc) return done(err);
									_confirm();
								});

					});
				};
			_confirm();
		};

	/**
	 * 处理4G订单
	 * @param  {[type]}   accountsEnable [description]
	 * @param  {Function} done    [description]
	 * @return {[type]}           [description]
	 */
	schema.statics.process4G = function(accountsEnable, done){
		//** 取出4G程序可处理的城市名称集合，仅处理这些城市的订单
		var cities = CBSS.getAccountCities(accountsEnable);
		var cityRegex = new RegExp('(' + cities.join('|') + ')');

		var Order = connection.model('Order');
		var PlatformSms = connection.model('PlatformSms');
		var _process = function(){
				//** find the order
				Order
					.findOneAndUpdate({
						'goods.category': {
							$in: ['4G'],
						},
						'department.city': {
							$regex: cityRegex,
						},
						'status': '已确认',
					}, {
						$set: {
							status: '已处理',
						}
					}, {
						'upsert': false,
						'new': true,
					}, function(err, order) {
						if (err || !order) return done(err);
						//** 处理4G订单的账号，分城市
						var staffAccount = CBSS.getAccountByCity(accountsEnable, order.department.city) || {};
						var productName  = order.goods.name || '';
						var productPrice = order.goods.price;
						var productBarcode = order.goods.barcode;
						//** 去掉最前面的4G标志
						productName = productName.replace(/^4G/,'');
						//** process 4G order
						if(productBarcode == '3001_100_1024_0' || //** 全国流量包(100元/1G)
							productBarcode == '3001_200_3072_0' || //** 全国流量半年包(200元/3G)
							productBarcode == '3001_50_500_0' || //** 全国流量包(50元/500M)
							productBarcode == '3002_100_1536_0'){ //** 省内流量包(100元/1.5G)
							//** 第一部分：账务管理，流量包资源订购
							var productZk = 100; //** 原价
							if(/五折/.test(productName)){
								productName = productName.replace('[五折]','');
								productBarcode = productBarcode.slice(0,-3);
								productZk = 50;
							}else if(/六折/.test(productName)){
								productName = productName.replace('[六折]','');
								productBarcode = productBarcode.slice(0,-3);
								productZk = 60;
							}
							CBSS.orderFlux({
								cwd: path.resolve(__dirname,'..'),//** 当前工作路径
								tempdir: './_tmp',
								release: staffAccount.release,//** 是否是产品环境
								staffId: staffAccount.staffId,//** 工号
								phone: order.customer.mobile,//** 订购业务的客户手机号码
								product: {
									name: productName,
									price: productPrice,
									barcode: productBarcode,
									zk: productZk,
								}
							},function(err, result){
								//** CBSS 接口返回错误
								if(err) console.log(err);
								//** 将状态改为“成功”或“失败”
								result = result || {};
								//** 如果不是登陆状态
								if(!result.login) return done(null,{logout: true});
								var RespCode = result.code || '88';
								var RespDesc = (result.status || '') + ': ' + (result.message || '未知错误');
								var EffectTime = '';
								var status = (RespCode == 200) ? '成功' : '失败';
								Order.findByIdAndUpdate(
									order._id,
									{
										$set: {
											status: status
										},
										$push: {
											'histories':  {
												respCode: RespCode,
												respDesc: RespDesc,
												effectTime: EffectTime,
												respTime: new Date(),
											}
										}
									}, {
										'upsert': false,
										'new': true,
									}, function(err){
										if(err) return done(err);
										//** 发送业务“处理成功”或“处理失败短信”短信
										//** 尊敬的用户您好，您订购的（产品名称）系统已受理，请耐心等待，订购结果将短信告知。
										var sms = {};
										//** sms业务代码部分
										sms.sender = String(order.goods && order.goods.smscode).replace(/\D/g,''); 
										sms.status = '新建';
										if(status == '成功'){
											sms.receiver = order.customer.mobile;
											sms.content = '恭喜您，您订购的(' + order.goods.name + ')已订购成功。' ;
											PlatformSms
												.create(sms, function(err){
													if(err) return done(err);
													//** 处理下一个
													_process();
												});
										}else{
											sms.content = '(' + order.goods.name + ')订购失败，详情请咨询10010，或到就近营业厅咨询办理。';
											//** 处理下一个
											_process();
										}
									});
							});
						}else if(/^8.*TD$/.test(productBarcode)){
							//** 第二部分：移网产品/变更
							CBSS.orderYiwang({
								cwd: path.resolve(__dirname,'..'),//** 当前工作路径
								tempdir: './_tmp',
								release: staffAccount.release,//** 是否是产品环境
								staffId: staffAccount.staffId,//** 工号
								phone: order.customer.mobile,//** 订购业务的客户手机号码
								product: {
									name: productName,
									price: productPrice,
									barcode: productBarcode,
								}
							},function(err, result){
								//** CBSS 接口返回错误
								if(err) console.log(err);
								//** 将状态改为“成功”或“失败”
								result = result || {};
								//** 如果不是登陆状态
								if(!result.login) return done(null,{logout: true});
								var RespCode = result.code || '88';
								var RespDesc = (result.status || '') + ': ' + (result.message || '未知错误');
								var EffectTime = '';
								var status = (RespCode == 200) ? '成功' : '失败';
								Order.findByIdAndUpdate(
									order._id,
									{
										$set: {
											status: status
										},
										$push: {
											'histories':  {
												respCode: RespCode,
												respDesc: RespDesc,
												effectTime: EffectTime,
												respTime: new Date(),
											}
										}
									}, {
										'upsert': false,
										'new': true,
									}, function(err){
										if(err) return done(err);
										//** 发送业务“处理成功”或“处理失败短信”短信
										//** 尊敬的用户您好，您订购的（产品名称）系统已受理，请耐心等待，订购结果将短信告知。
										var sms = {};
										//** sms业务代码部分
										sms.sender = String(order.goods && order.goods.smscode).replace(/\D/g,''); 
										sms.status = '新建';
										if(status == '成功'){
											sms.receiver = order.customer.mobile;
											sms.content = '恭喜您，您订购的(' + order.goods.name + ')已订购成功。' ;
											PlatformSms
												.create(sms, function(err){
													if(err) return done(err);
													//** 处理下一个
													_process();
												});
										}else{
											sms.content = '(' + order.goods.name + ')订购失败，详情请咨询10010，或到就近营业厅咨询办理。';
											//** 处理下一个
											_process();
										}
									});
							});
						}else{
							//** 处理下一个
							_process();
						}
					});
			};
		//** 启动第一个
		_process();
	};

	/**
	 * 订单按人排名
	 * @param  {[type]}   options [description]
	 * @param  {Function} done    [description]
	 * @return {[type]}           [description]
	 */
	schema.statics.rankByPerson = function(options,done){
		var days = options.days;
		var place = options.place;
		var department = options.department;
		var per = options.per;
		var page = options.page;
		//** 计算时间跨度
		var now = new Date();
		var begin = new Date(now.getTime() - (days-1) * 24 * 3600 * 1000); 
		var beginYear = begin.getFullYear();
		var beginMonth = begin.getMonth();
		var beginDate = begin.getDate();
		//** 开始日期
		var startDate = new Date(beginYear, beginMonth, beginDate); 
		var nowYear = now.getFullYear();
		var nowMonth = now.getMonth();
		var nowDate = now.getDate() + 1;
		//** 截止日期
		var endDate = new Date(nowYear, nowMonth, nowDate); 

		var Order = connection.model('Order');
		var Account = connection.model('Account');
		var aggregate = Order.aggregate();

		switch(place){
			case 'city':
				//** 过滤时间段和department.city字段
				var city = (department && department.city) || '';
				aggregate.append({
					$match: {
						lastupdatetime: {
							$gte: startDate,
							// $lt: endDate,
						},
						'department.city': city,
						'status': '成功',
					}
				});
				break;
			case 'grid':
				//** 过滤时间段和department.grid字段
				var grid = (department && department.grid) || '';
				aggregate.append({
					$match: {
						lastupdatetime: {
							$gte: startDate,
							// $lt: endDate,
						},
						'department.grid': grid,
						'status': '成功',
					}
				});
				break;
			case 'district':
				//** 过滤时间段和department.distric字段
				var district = (department && department.district) || '';
				aggregate.append({
					$match: {
						lastupdatetime: {
							$gte: startDate,
							// $lt: endDate,
						},
						'department.district': district,
						'status': '成功',
					}
				});
				break;
			case 'department':
			default:
				//** 过滤时间段和department.name字段
				var departmentName = (department && department.name) || '';
				aggregate.append({
					$match: {
						lastupdatetime: {
							$gte: startDate,
							// $lt: endDate,
						},
						'department.name': departmentName,
						'status': '成功',
					}
				});
				break;
		}
		//** 缩小数据量
		aggregate.append({
			$project: {
				quantity: 1,
				total: 1,
				bonus: 1,
				createBy:1,
				department: 1,
				status: 1,
				lastupdatetime: 1,
			}
		});
		//** 按createBy.mobile分组
		aggregate.append({
			$group: {
				_id: '$createBy.mobile',
				quantity: {
					'$sum': '$quantity',
				},
				total: {
					'$sum': '$total',
				},
				bonus: {
					'$sum': '$bonus',
				},
				count: {
					'$sum': 1
				}
			},
		});
		//** 按数量降序排列
		aggregate
			.sort({quantity: -1})
			.skip(per * page)
			.limit(per)
			.exec(function(err,docs){
				if(err) return done(err);
				//** 已获取按20个用户的统计信息
				//** 20个用户的_id
				var mobiles = [];
				// _.each(docs,function(doc){
				// 	mobiles.push(_.pick(doc,'_id'))
				// });
				mobiles = _.pluck(docs,'_id');
				//** 没有数据了
				if(mobiles.length == 0) return done(null,[]);
				//** 还有有数据
				Account
					.find({
						email: {
							$in: mobiles
						}
					})
					.select({
						username: 1,
						email: 1,
						department: 1,
					})
					// .select({}) //** 过滤信息
					.exec(function(err,users){
						if(err) return done(err);
						if(!users) return done(null,[]);
						var newUsers = [];
						_.each(users,function(user){
							var newUser = user.toJSON();
							//** 找到统计数组(mobile)中对应user的对象(email)
							var email = String(user.email);//** email = mobile
							var orderStat = _.findWhere(docs,{_id: email});
							//** 扩展对应user的统计信息
							newUser = _.defaults(newUser,orderStat);
							newUsers.push(newUser);
						});
						//** 返回带统计信息的用户数组
						done(null,_.sortBy(newUsers,'total').reverse());
					});
			});
	};
	/**
	 * 订单按营业厅排名
	 * @param  {[type]}   options [description]
	 * @param  {Function} done    [description]
	 * @return {[type]}           [description]
	 */
	schema.statics.rankByDepartment = function(options,done){
		var days = options.days;
		var place = options.place;
		var department = options.department;
		var per = options.per;
		var page = options.page;
		//** 计算时间跨度
		var now = new Date();
		var begin = new Date(now.getTime() - (days-1) * 24 * 3600 * 1000); 
		var beginYear = begin.getFullYear();
		var beginMonth = begin.getMonth();
		var beginDate = begin.getDate();
		//** 开始日期
		var startDate = new Date(beginYear, beginMonth, beginDate); 
		var nowYear = now.getFullYear();
		var nowMonth = now.getMonth();
		var nowDate = now.getDate() + 1;
		//** 截止日期
		var endDate = new Date(nowYear, nowMonth, nowDate); 

		var Order = connection.model('Order');
		var Account = connection.model('Account');
		var aggregate = Order.aggregate();

		switch(place){
			case 'city':
				//** 过滤时间段和department.city字段
				var city = (department && department.city) || '';
				aggregate.append({
					$match: {
						lastupdatetime: {
							$gte: startDate,
							// $lt: endDate,
						},
						'department.city': city,
						'status': '成功',
					}
				});
				break;
			case 'district':
				//** 过滤时间段和department.distric字段
				var district = (department && department.district) || '';
				aggregate.append({
					$match: {
						lastupdatetime: {
							$gte: startDate,
							// $lt: endDate,
						},
						'department.district': district,
						'status': '成功',
					}
				});
				break;

			case 'grid':
			default:
				//** 过滤时间段和department.grid字段
				var grid = (department && department.grid) || '';
				aggregate.append({
					$match: {
						lastupdatetime: {
							$gte: startDate,
							// $lt: endDate,
						},
						'department.grid': grid,
						'status': '成功',
					}
				});
				break;
		}
		//** 缩小数据量
		aggregate.append({
			$project: {
				quantity: 1,
				total: 1,
				bonus: 1,
				createBy:1,
				department: 1,
				status: 1,
				lastupdatetime: 1,
			}
		});
		//** 按department.name分组
		aggregate.append({
			$group: {
				_id: '$department.name',
				quantity: {
					'$sum': '$quantity',
				},
				total: {
					'$sum': '$total',
				},
				bonus: {
					'$sum': '$bonus',
				},
				count: {
					'$sum': 1
				}
			},
		});
		//** 按数量降序排列
		aggregate
			.sort({quantity: -1})
			.skip(per * page)
			.limit(per)
			.exec(function(err,docs){
				if(err) return done(err);
				//** 已获取按20个department.name的统计信息
				return done(null,docs);
				//** 20个用户的_id
				var mobiles = [];
				// _.each(docs,function(doc){
				// 	mobiles.push(_.pick(doc,'_id'))
				// });
				mobiles = _.pluck(docs,'_id');
				//** 没有数据了
				if(mobiles.length == 0) return done(null,[]);
				//** 还有有数据
				Account
					.find({
						email: {
							$in: mobiles
						}
					})
					.select({
						username: 1,
						email: 1,
					})
					// .select({}) //** 过滤信息
					.exec(function(err,users){
						if(err) return done(err);
						if(!users) return done(null,[]);
						var newUsers = [];
						_.each(users,function(user){
							var newUser = user.toJSON();
							//** 找到统计数组(mobile)中对应user的对象(email)
							var email = String(user.email);//** email = mobile
							var orderStat = _.findWhere(docs,{_id: email});
							//** 扩展对应user的统计信息
							newUser = _.defaults(newUser,orderStat);
							newUsers.push(newUser);
						});
						//** 返回带统计信息的用户数组
						done(null,_.sortBy(newUsers,'total').reverse());
					});
			});
	};

	return connection.model('Order', schema);
};
