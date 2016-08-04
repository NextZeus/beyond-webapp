var _ = require('underscore');
var FormView = require('./__FormView'),
	$ = require('jquery'),
	Backbone = require('backbone'),
    bonusTpl = require('../templates/_entityBonus.tpl');
var config = require('../conf');

Backbone.$ = $;

//** 主视图
exports = module.exports = Backbone.View.extend({

	el: '#content',

	initialize: function(options) {
		this.router = options.router;
		var page = $(bonusTpl);
		var exportTemplate = $('#bonusExecTemplate', page).html();
		this.template = _.template(_.unescape(exportTemplate || ''));
		this.on('load', this.load, this);
	},

	events: {
		'click input[type=submit]': 'submit',
		'click .back': 'cancel',
	},

	load: function(){
		this.render();
	},

	submit: function(){
		var year = this.$('input[name=year]').val();
		var month = this.$('input[name=month]').val();
		var city = this.$('input[name=city]').val();
		if(window.confirm('后台将处理请求，可能需要几分钟处理。确认吗？')){
			$.ajax({
				url: config.api.host + '/protect/finance/statements?action=bonusExec',
				type: 'POST',
				data: {
					year: year,
					month: month,
					city: city,
				},
				xhrFields: {
					withCredentials: true
				},
				crossDomain: true,
			}).done(function(data) {
			}).fail(function() {
			});
			window.history.back();
		}
		return false;
	},

	cancel: function() {
		this.router.navigate('bonus/index', {
			trigger: true,
			replace: true
		});
		return false;
	},

	render: function() {
		this.$el.html(this.template());
		return this;
	},
});