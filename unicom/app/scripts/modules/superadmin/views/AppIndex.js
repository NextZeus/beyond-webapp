var _ = require('underscore');
var $ = require('jquery'),
	Backbone = require('backbone'),
    appTpl = require('../templates/_entityApp.tpl'),
	loadingTpl = require('../templates/__loading.tpl');
var config = require('../conf');
var ListView = require('./__ListView');
var SearchView = require('./__SearchView');

Backbone.$ = $;

//** 模型
var App = Backbone.Model.extend({
	idAttribute: '_id',
	urlRoot: config.api.host + '/protect/apps',
	defaults: {
		status: {}
	},
	validation: {
		name: {
			required: true,
			msg: '请输入名称(中英文字母)'
		},
		nickname: {
			required: true,
			msg: '请输入编码(字母、_与数字的组合)'
		}
	},
});

//** 集合
var AppCollection = Backbone.Collection.extend({
	url: config.api.host + '/protect/apps',
	model: App,
});

//** list子视图
var AppListView = ListView.extend({
	el: '#list',

	initialize: function(options){
		var page = $(appTpl);
		var itemTemplate = $('#itemTemplate', page).html();
		this.template = _.template(_.unescape(itemTemplate || ''));
		this.collection = new AppCollection();
		ListView.prototype.initialize.apply(this,options);
	},
	getNewItemView: function(model){
		return this.template({model: model.toJSON()});
	},
});

//** search子视图
var AppSearchView = SearchView.extend({
	el: '#search',

	initialize: function(options){
		var page = $(appTpl);
		var searchTemplate = $('#searchTemplate', page).html();
		this.template = _.template(_.unescape(searchTemplate || ''));
		this.on('load', this.load,this);
	},

	events: {
		'submit form': 'search'
	},

	load: function(){
		this.render();
	},

	search: function(){
		var query = this.$('form').serialize();
		this.done(query);
		return false;
	},

	render: function(){
		this.$el.html(this.template());
	},
});

//** 主视图
exports = module.exports = Backbone.View.extend({

	el: '#content',

	loadingTemplate: _.template(loadingTpl),

	initialize: function(options) {
		this.router = options.router;
		var page = $(appTpl);
		var indexTemplate = $('#indexTemplate', page).html();
		this.template = _.template(_.unescape(indexTemplate || ''));
		this.on('load', this.load, this);
	},

	events: {
		'scroll': 'scroll',
		'click .add': 'addApp',
		'click .edit': 'editApp',
		'click .delete': 'removeApp',
	},

	load: function() {
		var that = this;
		this.loaded = true;
		this.render();

		this.searchView = new SearchView({
			el: '#search',
		});
		this.searchView.done = function(query){
			that.listView.trigger('refresh', query);
		};
		this.listView = new AppListView({
			el: '#list',
		});
		this.searchView.trigger('load');
		this.listView.trigger('load');
	},

	scroll: function() {
		this.listView.scroll();
		return false;
	},
	addApp: function(){
		this.router.navigate('app/add',{trigger: true});
		return false;
	},

	editApp: function(evt){
		var id = this.$(evt.currentTarget).parent().attr('id');
		this.router.navigate('app/edit/'+ id,{trigger: true});
		return false;
	},

	removeApp: function(evt){
		if(window.confirm('您确信要删除吗？')){
			var id = this.$(evt.currentTarget).parent().attr('id');
			var model = new App({_id: id});
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