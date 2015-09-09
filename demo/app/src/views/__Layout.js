var _ = require('underscore');
var $ = require('jquery'),
    Backbone = require('backbone'),
    layoutTemplate = require('../../assets/templates/__layout.tpl'),
    loadingTemplate = require('../../assets/templates/loading.tpl');


Backbone.$ = $;

exports = module.exports = Backbone.View.extend({

	el: 'body',

	chatUnreadNum: 0, //未读聊天消息数量
	messageUnreadNum: 0, //好友未读私信数量
	statusUnreadNum: 0, //好友圈未读新消息数量

	loaded: false,
	initialize: function(options){
		this.appEvents = options.appEvents;
		this.socketEvents = options.socketEvents;


		this.$el
			.addClass('has-sidebar-left')
			.addClass('has-sidebar-right')
			.addClass('has-navbar-top');
		this.appEvents.on('set:brand', this.updateBrand,this);
		this.socketEvents.on('socket:in:chat', this.onChatIn, this);
		this.socketEvents.on('socket:in:message', this.onMessageIn, this);
		this.socketEvents.on('socket:in:status', this.onStatusIn, this);
		this.on('load', this.load,this);
	},

	events: {
		'click .list-group-item': 'activeItem',
		'click #left-sidebar-toggle': 'leftSideBarToggle',
		'click #right-sidebar-toggle': 'rightSideBarToggle',
		'click .sidebar-left': 'closeLeftSideBar',
		'click .sidebar-right': 'closeRightSideBar',
	},

	load: function(){
		this.loaded = true;
		this.render();
	},

	activeItem: function(evt){
		var currentItem = evt.currentTarget;
		this.$('.list-group-item').removeClass('active');
		this.$(currentItem).addClass('active');
		if(this.$(currentItem).find('.status-unread').length > 0){
			this.statusUnreadNum = 0;
			this.$('.status-unread').html('<i class="fa fa-chevron-right"></i>');
		}else if(this.$(currentItem).find('.message-unread').length > 0){
			this.messageUnreadNum = 0;
			this.$('.message-unread').html('<i class="fa fa-chevron-right"></i>');
		}
	},

	leftSideBarToggle: function(){
		var visible = this.$el.hasClass('sidebar-left-visible');
		if(!visible){
			this.$el
				.addClass('sidebar-left-in')
				.addClass('sidebar-left-visible');
		}else{
			this.$el
				.removeClass('sidebar-left-in')
				.removeClass('sidebar-left-visible');
		}
		// return false;
	},

	rightSideBarToggle: function(){
		var visible = this.$el.hasClass('sidebar-right-visible');
		if(!visible){
			this.$el
				.addClass('sidebar-right-in')
				.addClass('sidebar-right-visible');
		}else{
			this.$el
				.removeClass('sidebar-right-in')
				.removeClass('sidebar-right-visible');
		}
		// return false;
	},

	closeLeftSideBar: function(){
		this.leftSideBarToggle();
	},

	closeRightSideBar: function(){
		this.rightSideBarToggle();
	},

	updateBrand: function(brand){
		this.$('.navbar-brand').text(brand || '');
	},

	onChatIn: function(){
		this.chatUnreadNum ++;
		if(this.chatUnreadNum < 1) {
			this.chatUnreadNum = 0;
			this.$('.chat-total-unread').text('');
		}else{
			this.$('.chat-total-unread').text(this.chatUnreadNum);
		}
	},

	onMessageIn: function(data){
		this.messageUnreadNum ++;
		if(this.messageUnreadNum < 1) {
			this.messageUnreadNum = 0;
			this.$('.message-unread').html('<i class="fa fa-chevron-right"></i>');
		}else{
			this.$('.message-unread').html('<span class="badge">' + this.messageUnreadNum + '</span>');
		}
	},

	onStatusIn: function(data){
		this.statusUnreadNum ++;
		if(this.statusUnreadNum < 1) {
			this.statusUnreadNum = 0;
			this.$('.status-unread').html('<i class="fa fa-chevron-right"></i>');
		}else{
			this.$('.status-unread').html('<span class="badge">' + this.statusUnreadNum + '</span>');
		}
	},

	render: function(){
		if(!this.loaded){
			this.$el.html(loadingTemplate());
		}else{
			this.$el.html(layoutTemplate());
		}
		return this;
	}
});