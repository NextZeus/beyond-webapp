var _ = require('underscore');
var $ = require('jquery'),
	Backbone = require('backbone'),
    sessionTpl = require('../templates/_entityPlatformSession.tpl'),
	loadingTpl = require('../templates/__loading.tpl');
var config = require('../conf');

var Session = require('../models/PlatformSession');

Backbone.$ = $;

var ListView = require('./_PlatformSessionList');
var SearchView = require('./_PlatformSessionSearch');

exports = module.exports = Backbone.View.extend({

	el: '#content',

	loadingTemplate: _.template(loadingTpl),

	initialize: function(options) {
		this.router = options.router;
		var page = $(sessionTpl);
		var indexTemplate = $('#indexTemplate', page).html();
		this.template = _.template(_.unescape(indexTemplate || ''));
		this.on('load', this.load, this);
	},

	events: {
		'scroll': 'scroll',
		'click .add': 'addSession',
		'click .edit': 'editSession',
		'click .delete': 'removeSession',
	},

	load: function() {
		var that = this;
		this.loaded = true;
		this.render();

		this.listView = new ListView({
			el: '#list',
		});
		this.searchView = new SearchView({
			el: '#search',
		});
		this.searchView.done = function(query){
			that.listView.trigger('refresh', query);
		};
		this.listView.trigger('load');
		this.searchView.trigger('load');
	},

	scroll: function() {
		this.listView.scroll();
		return false;
	},
	
	addSession: function(){
		this.router.navigate('session/add',{trigger: true});
		return false;
	},

	editSession: function(evt){
		var id = this.$(evt.currentTarget).parent().attr('id');
		this.router.navigate('session/edit/'+ id,{trigger: true});
		return false;
	},

	removeSession: function(evt){
		if(window.confirm('您确信要删除吗？')){
			var id = this.$(evt.currentTarget).parent().attr('id');
			var model = new Session({_id: id});
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