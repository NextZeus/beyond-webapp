var _ = require('underscore');
var $ = require('jquery');
var	Backbone = require('backbone');
var config = require('../conf');
var ListView = require('./common/__ListView');
var Utils = require('./common/__Util');

Backbone.$ = $;

//** Activity模型
var Activity = Backbone.Model.extend({
	idAttribute: '_id',
	urlRoot: config.api.host + '/public/account/activities',	
	defaults: {
	}
});
//** Activity集合
var ActivityCollection = Backbone.Collection.extend({
	model: Activity,
	url: config.api.host + '/public/account/activities',
});

//** List子视图
var ActivityListView = ListView.extend({
	el: '#list',
	template: _.template($('#tpl-activity-item').html()),

	initialize: function(options){
		this.collection = new ActivityCollection();
		ListView.prototype.initialize.apply(this,options);
	},
	getNewItemView: function(model){
		this._convertContent(model);
		this._transformTime(model);
		var item = '<div>' + this.template({model: model.toJSON()}) + '</div>';
		var $item = $(item);
		$item.find('img').attr('src', model.get('avatar'));
		return $item.html();
	},

	_convertContent: function(model){
		var type = model.get('type');
		var contentObject = model.get('content');
		var newContent = Utils.buildContent(type, contentObject);
		model.set('content',newContent);
	},

	_transformTime: function(model){
		var createtime = model.get('lastupdatetime');
		var deltatime = Utils.transformTime(createtime);
		model.set('deltatime', deltatime);
	},
});

exports = module.exports = Backbone.View.extend({

	el: '#content',
	template: _.template($('#tpl-activity-index').html()),

	initialize: function(options) {
		this.router = options.router;
		this.on('load', this.load, this);
	},

	events: {
		'scroll': 'scroll',
		'click .view': 'activityView',
	},

	load: function() {
		var that = this;
		this.loaded = true;
		this.render();
		// var carousel =	setInterval(function(){
		// 	var current = that.$('.carousel-inner .item.active');
		// 	if(current.length == 0) return clearInterval(carousel);
		// 	var next = that.$('.carousel-inner .item.active').next();
		// 	if(next.length == 0) next = that.$('.carousel-inner .item')[0];
		// 	$(next).addClass('active');
		// 	$(current).removeClass('active');
		// 	console.log('carousel running.');
		// },10000);
		this.listView = new ActivityListView({
			el: '#list',
		});
		this.listView.trigger('load');
	},

	scroll: function() {
		this.listView.scroll();
		return false;
	},

	activityView: function(evt){
		var id = this.$(evt.currentTarget).parent().attr('id');
		this.router.navigate('activity/view/'+ id,{trigger: true});
		return false;
	},
	
	render: function() {
		this.$el.html(this.template());
		return this;
	},
});