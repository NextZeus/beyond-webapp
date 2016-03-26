var _ = require('underscore');
var $ = require('jquery'),
	Backbone = require('backbone'),
    smsTpl = require('../templates/_entitySms.tpl'),
	loadingTpl = require('../templates/__loading.tpl');
var config = require('../conf');
var ListView = require('./__ListView');

Backbone.$ = $;

//** 模型
var Sms = Backbone.Model.extend({
	idAttribute: '_id',
	urlRoot: config.api.host + '/protect/smses',	

});

//** 集合
var SmsCollection = Backbone.Collection.extend({
	url: config.api.host + '/protect/smses',
	model: Sms,
});

//** list 子视图
var SmsListView = ListView.extend({
	el: '#list',

	initialize: function(options){
		var page = $(smsTpl);
		var itemTemplate = $('#itemTemplate', page).html();
		this.template = _.template(_.unescape(itemTemplate || ''));
		this.collection = new SmsCollection();
		ListView.prototype.initialize.apply(this,options);
	},
	getNewItemView: function(model){
		return this.template({model: model.toJSON()});
	},
});

//** 主视图
exports = module.exports = Backbone.View.extend({

	el: '#content',

	loadingTemplate: _.template(loadingTpl),

	initialize: function(options) {
		this.router = options.router;
		var page = $(smsTpl);
		var indexTemplate = $('#indexTemplate', page).html();
		this.template = _.template(_.unescape(indexTemplate || ''));
		this.on('load', this.load, this);
	},

	events: {
		'scroll': 'scroll',
		'click .add': 'addSms',
		'click .edit': 'editSms',
		'click .delete': 'removeSms',
	},

	load: function() {
		var that = this;
		this.loaded = true;
		this.render();
		this.listView = new SmsListView({
			el: '#list',
		});
		this.listView.trigger('load');
	},

	scroll: function() {
		this.listView.scroll();
		return false;
	},

	addSms: function(evt){
		this.router.navigate('sms/add',{trigger: true});
		return false;
	},

	editSms: function(evt){
		var $item = this.$(evt.currentTarget).parent().parent();
		var id = $item.attr('id');
		this.router.navigate('sms/edit/'+ id,{trigger: true});
		return false;
	},

	removeSms: function(evt){
		var $item = this.$(evt.currentTarget).parent().parent();
		var id = $item.attr('id');
		if(window.confirm('您确信要删除吗？')){
			var model = new Sms({_id: id});
			model.destroy({wait: true});
			this.listView.trigger('refresh');
		}
		return false;
	},

	render: function() {
		if (!this.loaded) {
			this.$el.html(this.loadingTemplate());
		} else {
			this.$el.html(this.template());
		}
		return this;
	},
});