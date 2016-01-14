var _ = require('underscore');
var FormView = require('./__FormView'),
	$ = require('jquery'),
    mediaTpl = require('../templates/_entityMedia.tpl'),
	Media = require('../models/Media');
var config = require('../conf');

exports = module.exports = FormView.extend({

	el: '#mediaForm',

	modelFilled: false,

	initialize: function(options) {
		this.router = options.router;
		this.model = new Media({_id: options.id});
		var page = $(mediaTpl);
		var editTemplate = $('#editTemplate', page).html();
		this.template = _.template(_.unescape(editTemplate || ''));
		FormView.prototype.initialize.apply(this, options);
	},

	events: {
		'submit form': 'submit',
		'click .back': 'cancel',
	},

	load: function(){
		this.model.fetch({
			xhrFields: {
				withCredentials: true
			},
		});
	},

	submit: function() {
		var that = this;
		var object = this.$('form').serializeJSON();
		this.model.set(object);
		// console.log(this.model.attributes);
		this.model.save(null, {
			xhrFields: {
				withCredentials: true
			},
		});
		return false;
	},
	

	cancel: function(){
		this.router.navigate('media/index',{trigger: true, replace: true});
		return false;
	},

	//fetch event: done
	done: function(response){
		if(!this.modelFilled){
			//first fetch: get model
			this.modelFilled = true;
			this.render();
		}else{
			//second fetch: submit
			this.router.navigate('media/index',{trigger: true, replace: true});
		}
	},

	render: function(){
		this.$el.html(this.template({model: this.model.toJSON()}));
		this.$('img').attr('src', this.model.get('url'));
		if(this.model.isNew()) this.$('.panel-title').text('新增媒体文件');
		return this;
	},
});