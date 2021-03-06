var _ = require('underscore');
var $ = require('jquery'),
	Backbone = require('backbone'),
	loadingTpl = require('../templates/__loading.tpl');
var config = require('../conf');

Backbone.$ = $;

var SearchView = require('../views/_TradeTransactionSearch2');
var GraphView = require('../views/_TradeTransactionGraph');

exports = module.exports = Backbone.View.extend({

	el: '#content',

	loadingTemplate: _.template(loadingTpl),
	template: _.template('<div><a class="btn btn-primary" onclick="window.history.back();return false;">返回</a></div><hr/><div id="search"></div><div id="graph"></div>'),

	initialize: function(options) {
		this.symbol = options.symbol;
		this.on('load', this.load, this);
	},

	events: {
	},

	load: function() {
		var that = this;
		this.loaded = true;
		this.render();

		this.graphView = new GraphView({symbol: this.symbol});

		this.searchView = new SearchView({
			el: '#search',
		});

		this.searchView.done = function(query){
			that.graphView.trigger('refresh', query);
		};
		this.graphView.trigger('load');
		this.searchView.trigger('load');
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