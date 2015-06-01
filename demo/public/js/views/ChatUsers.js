define(['text!templates/chatusers.html','views/ChatUser','views/ChatSession','models/ChatCollection'],
	function(ChatUsersTemplate,ChatUserView,ChatSessionView,ChatCollection){

	var ChatUsersView = Backbone.View.extend({
		template: _.template(ChatUsersTemplate),
		el: $('#chat'),

		initialize: function(options){
			this.socketEvents = options.socketEvents;
			this.collection.on('reset', this.onCollectionReset, this);
			this.currentChatView = options.currentChatView;
			this.chatSessions = options.chatSessions;
		},

		onContactAdded: function(contact){
			var chatUserView = new ChatUserView({
				model: contact,
				socketEvents: this.socketEvents
			});
			chatUserView.bind('chat:start', this.startChatSession, this);
			var chatUserHtml = chatUserView.render().el;
			$(chatUserHtml).appendTo('.chat_list');
		},

		onCollectionReset: function(collection){
			var that = this;
			$('.chat_list').empty();
			collection.each(function(contact){
				that.onContactAdded(contact);
			});
		},
		render: function(){
			this.$el.html(this.template());
			return this;
		},
		// currentChatView: null,
		// chatSessions: {},
		startChatSession: function(model){
			if(null != this.currentChatView){
				this.currentChatView.undelegateEvents();
			}
			
			var roomId = model.get('accountId');
			if(!this.chatSessions[roomId]){
				var chatCollection = new ChatCollection();
				var chatSessionView = new ChatSessionView({
						room: model,
						collection: chatCollection,
						socketEvents: this.socketEvents
					});
				chatSessionView.render();
				chatCollection.url = '/chats/' + roomId;
				chatCollection.fetch();
				this.chatSessions[roomId] = chatSessionView;
			}else{
				var view = this.chatSessions[roomId];
				view.delegateEvents();
				view.render();
				var collection = view.collection;
				collection.trigger('reset',collection);
			}

			this.currentChatView = this.chatSessions[roomId];
		}
	});
	return ChatUsersView;
});