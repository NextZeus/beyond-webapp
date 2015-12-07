var _ = require('underscore');
var $ = require('jquery'),
    Backbone = require('backbone'),
    ListView = require('./__ListView'),
    channelCategoryTpl = require('../templates/_entityChannelCategory.tpl'),
    RoleCollection = require('../models/RoleCollection');

Backbone.$ = $;
	
exports = module.exports = ListView.extend({
	el: '#list',

	initialize: function(options){
		var page = $(channelCategoryTpl);
		var itemTemplate = $('#itemTemplate', page).html();
		this.template = _.template(_.unescape(itemTemplate || ''));
		this.collection = new RoleCollection();
		ListView.prototype.initialize.apply(this,options);
	},
	getNewItemView: function(model){
		return this.template({model: model.toJSON()});
	},
});
