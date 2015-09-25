var _ = require('underscore');
var $ = require('jquery'),
    Backbone = require('backbone'),
    menuBarTemplate = require('../../assets/templates/_barProject.tpl'),
    chatFormTemplate = require('../../assets/templates/_formProjectChat.tpl'),
    FormView = require('./__FormView'),
    Status = require('../models/Status');

Backbone.$ = $;

exports = module.exports = FormView.extend({

	className: 'bottom-bar',

	initialize: function(options){				
		this.id = options.id;
		this.project = options.project;
		this.account = options.account;
		this.socketEvents = options.socketEvents;
		this.parentView = options.parentView;
	},

	barToggle: true,
	
	events: {
		'submit form': 'sendChat',
		'click .send-file': 'showFileExplorer',
		'change input[name=file]': 'uploadFile',
		'click .chat-toggle': 'changeToolbar'
	},

	sendChat: function(){
		var chatText = $('input[name=chat]').val();
		if(chatText && /[^\s]+/.test(chatText)){

			var status = new Status({
				fromId: this.account.id,
				toId: this.id,
				username: this.account.username,
				avatar: this.account.avatar,
				content: chatText
			});
			this.parentView.collection.add(status);
			this.parentView.onChatAdded(status);

			this.socketEvents.trigger('socket:out:project',{
				to: {
					id: this.id
				},
				content: chatText
			});
		}
		$('input[name=chat]').val('');
		return false;
	},

	showFileExplorer: function(){
		$('input[name=file]').click();
		return false;
	},

	uploadFile: function(evt){
		var that = this;
		var formData = new FormData();
		formData.append('files',evt.currentTarget.files[0]);
		$.ajax({
			url: '/attachments',
			type: 'POST',
			data: formData,
			cache: false,//MUST be false
			processData: false,//MUST be false
			contentType:false,//MUST be false
			success: function(data){
				if(data && data.type){
					var content = 'http://' + location.host + data.filename;
					// if(/jpg|png/.test(data.type)){
						var status = new Status({
							fromId: that.account.id,
							toId: that.id,
							username: that.account.username,
							avatar: that.account.avatar,
							content: content
						});
						that.parentView.collection.add(status);
						that.parentView.onChatAdded(status);
					
						that.socketEvents.trigger('socket:out:project',{
							to: {
								id: that.id
							},
							content: content,
						});
					// }
				}
				that.$('input[name=file]').val('');
			},
			error: function(err){
				that.$('input[name=file]').val('');
				console.log(err);
			},
		});
      	return false;
	},

	changeToolbar: function(){
		this.barToggle = !this.barToggle;
		if(this.barToggle){
			window.location.hash = 'project/chat/' + this.id;
		}
		this.render();
		return false;
	},

	render: function(){
		if(this.barToggle){
			this.$el.html(chatFormTemplate({project: this.project.toJSON()}));
		}else{
			this.$el.html(menuBarTemplate({id: this.id}));
		}
		return this;
	}
});