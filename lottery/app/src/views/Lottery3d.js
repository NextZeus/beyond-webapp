var _ = require('underscore');
var $ = require('jquery'),
    Backbone = require('backbone'),
    lottery3dTemplate = require('../../assets/templates/lottery3d.tpl');
var config = require('../conf');

Backbone.$ = $;


exports = module.exports = Backbone.View.extend({

	el: '#content',

	events: {

		'submit form.lottery': 'lotteryForm',
	},

	initialize: function(options){
		this.account = options.account;
		this.id = options.id;
		this.on('load', this.load,this);
	},

	load: function(){
	},


	lotteryForm: function(){
		window.location.hash = 'order/detail/empty';
		return false;
	},

	render: function(){
		this.$el.html(lottery3dTemplate());
		return this;
	}

});