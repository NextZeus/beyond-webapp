var _ = require('underscore');
var $ = require('jquery'),
	Backbone = require('backbone'),
	chatFormTemplate = require('../templates/_formChat.tpl'),
	FormView = require('./__FormView'),
	Chat = require('../models/Chat');
var config = require('../conf');

Backbone.$ = $;

exports = module.exports = FormView.extend({

	className: 'bottom-bar',

	initialize: function(options) {
		this.id = options.id;
		this.account = options.account;
		this.socketEvents = options.socketEvents;
		this.parentView = options.parentView;
	},

	events: {
		'submit form': 'sendText',
		'click .send-file': 'showFileExplorer',
		'change input[name=file]': 'sendFile',
	},

	sendText: function() {
		var that = this;
		var text = $('input[name=chat]').val();
		if (text && /[^\s]+/.test(text)) {
			var chat = new Chat({
				fid: this.id
			});
			chat.set('type', 'text');
			chat.set('content', {
				body: text
			});
			if (chat.isValid()) {
				var xhr = chat.save();
				if (xhr) {
					xhr
						.success(function(data) {
							if (!!data.code) {
								console.log(data);
								return;
							}
							$('input[name=chat]').val('');

							//update UI
							that.done(new Chat(data));
							//trigger socket.io
							that.socketEvents.trigger('socket:out:chat',{
								action: 'chat',
								to: that.id,
								text: chat.toJSON()
							});
						})
						.error(function(xhr) {
							console.log(xhr);
						});
				}
			}
		}
		return false;
	},

	showFileExplorer: function() {
		$('input[name=file]').click();
		return false;
	},

	sendFile: function(evt) {
		var that = this;
		var formData = new FormData();
		formData.append('files', evt.currentTarget.files[0]);
		$.ajax({
			url: config.api.host + '/attachments',
			type: 'POST',
			xhrFields: {
				withCredentials: true
			},
			data: formData,
			cache: false, //MUST be false
			processData: false, //MUST be false
			contentType: false, //MUST be false
		}).done(function(data) {
			if (data && data.type) {
				var chat = new Chat({
					fid: that.id
				});
				chat.set('type', 'image');
				chat.set('content', {
					urls: config.api.host + data.filename,
				});

				var xhr = chat.save();
				if (xhr) {
					xhr
						.success(function(data) {
							if (!!data.code) return console.log(data);
							that.done(new Chat(data));
						})
						.error(function(xhr) {
							console.log(xhr);
						});
				}
				// that.socketEvents.trigger('socket:out:chat', {
				// 	to: {
				// 		id: this.id
				// 	},
				// 	content: chatText
				// });
				// that.socketEvents.trigger('socket:chat',{
				// 	action: 'chat',
				// 	to: that.id,
				// 	text: chatText
				// });
			}
			that.$('input[name=file]').val('');
		}).fail(function(err) {
			that.$('input[name=file]').val('');
			console.log(err);
		});
		return false;
	},

	render: function() {
		this.$el.html(chatFormTemplate());
		return this;
	}
});