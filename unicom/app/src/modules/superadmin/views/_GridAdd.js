var _ = require('underscore');
var FormView = require('./__FormView'),
	$ = require('jquery'),
    gridTpl = require('../templates/_entityGrid.tpl'),
	Grid = require('../models/Grid');

exports = module.exports = FormView.extend({

	el: '#gridForm',

	initialize: function(options) {
		var page = $(gridTpl);
		var addTemplate = $('#addTemplate', page).html();
		this.template = _.template(_.unescape(addTemplate || ''));
		this.model = new Grid();
		FormView.prototype.initialize.apply(this, options);
	},

	events: {
		'submit form': 'submit',
	},

	load: function(){
		this.render();
	},

	submit: function() {
		var that = this;
		var object = this.$('form').serializeJSON();
		this.model.set(object);
		if(object.status.code == 0){
			object.status.message = '无效';
		}else{
			object.status.message = '有效';
		}
		// console.log(this.model.attributes);
		this.model.save(null, {
			xhrFields: {
				withCredentials: true
			},
		});
		return false;
	},

	done: function(response){
		window.location.hash = 'grid/index';
	},

	render: function(){
		this.$el.html(this.template({model: this.model.toJSON()}));
		return this;
	},
});