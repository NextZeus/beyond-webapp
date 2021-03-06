var _ = require('underscore');
var $ = require('jquery'),
	Backbone = require('backbone'),
    gridTpl = require('../templates/_entityGrid.tpl'),
	loadingTpl = require('../templates/__loading.tpl');
var config = require('../conf');

Backbone.$ = $;

var Grid = require('../models/Grid');
var ListView = require('./_GridList');
var SearchView = require('./_GridSearch');

exports = module.exports = Backbone.View.extend({

	el: '#content',

	loadingTemplate: _.template(loadingTpl),

	initialize: function(options) {
		this.router = options.router;
		var page = $(gridTpl);
		var indexTemplate = $('#indexTemplate', page).html();
		this.template = _.template(_.unescape(indexTemplate || ''));
		this.on('load', this.load, this);
	},

	events: {
		'scroll': 'scroll',
		'click .add': 'addGrid',
		'click .edit': 'editGrid',
		'click .delete': 'removeGrid',
	},

	load: function() {
		var that = this;
		this.loaded = true;
		this.render();

		this.searchView = new SearchView({
			el: '#search',
		});
		this.listView = new ListView({
			el: '#list',
		});
		this.searchView.trigger('load');
		this.listView.trigger('load');
	},

	scroll: function() {
		this.listView.scroll();
		return false;
	},
	
	addGrid: function(){
		this.router.navigate('grid/add',{trigger: true});
		return false;
	},

	editGrid: function(evt){
		var id = this.$(evt.currentTarget).parent().attr('id');
		this.router.navigate('grid/edit/'+ id,{trigger: true});
		return false;
	},

	removeGrid: function(evt){
		if(window.confirm('您确信要删除吗？')){
			var id = this.$(evt.currentTarget).parent().attr('id');
			var model = new Grid({_id: id});
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