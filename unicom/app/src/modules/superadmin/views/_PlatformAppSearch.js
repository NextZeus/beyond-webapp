var _ = require('underscore');
var Backbone = require('backbone');
var $ = require('jquery'),
    appTpl = require('../templates/_entityPlatformApp.tpl'),
    SearchView = require('./__SearchView');
var config = require('../conf');

exports = module.exports = SearchView.extend({
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