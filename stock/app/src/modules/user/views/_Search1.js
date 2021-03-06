var _ = require('underscore');
var Backbone = require('backbone');
var $ = require('jquery'),
    SearchView = require('./__SearchView');
var config = require('../conf');

var SearchModel = Backbone.Model.extend({

});

exports = module.exports = SearchView.extend({
	el: '#search',

	initialze: function(options){
		this.template = _.template(_.unescape(options.template || ''));
		this.model = new SearchModel();
		this.on('load', this.load,this);
	},

	events: {
		'submit form': 'search'
	},

	load: function(){
		this.render();
	},

	search: function(){
		var url = 'from=' + $('input[name=from]').val() + '&to=' + $('input[name=to]').val();
		this.done(url);
		return false;
	},

	render: function(){
		this.$el.html(this.template({model: this.model.toJSON()}));
	}

});