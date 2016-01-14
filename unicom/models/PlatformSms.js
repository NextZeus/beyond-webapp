module.exports = exports = function(mongoose) {

	var schema = new mongoose.Schema({
		mobile: String,
		content: String,
		series: String,//SMS 发送时的序列号
		replies: [],
		creator: {
			id: String,
			model: String,
		},
		tryTimes: {
			type: Number,
			default: 0,
		},
		status: {
			type: String,
			enum: {
				values: '新建|已发送|已确认|已订购|已取消|已处理|失败'.split('|'),
				message: 'enum validator failed for path {PATH} with value {VALUE}',
			}
		},
		lastupdatetime: {
			type: Date,
			default: Date.now
		},		
	});

	schema.set('collection', 'platform.smses');
	return mongoose.model('PlatformSms', schema);
};