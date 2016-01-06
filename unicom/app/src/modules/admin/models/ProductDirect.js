var _ = require('underscore');
var Backbone = require('backbone');
var config = require('../conf');

exports = module.exports = Backbone.Model.extend({
	idAttribute: '_id',
	urlRoot: config.api.host + '/product/directs',	
	defaults: {
		goods: {}
	},
	validation: {
	    'name': {
	    	minLength: 2,
	    	msg:'长度至少两位'
	    },
	    'goods[id]': {
			required: true,
			msg: '请选择一个物料'
	    }
	},
});