define(['text!templates/projectContacts.html','views/BottomBar0','views/ProjectContact','models/ContactCollection'],
	function(contactsTemplate, BottomBarView, ContactView,ContactCollection){
	var ContactsView = Backbone.View.extend({
		el: '#content',
		
		template: _.template(contactsTemplate),
		
		initialize: function(options){
			this.pid = options.pid;
			this.collection = new ContactCollection();
			this.collection.url = '/projects/' + this.pid + '/contacts';
			this.collection.on('add', this.contactAdded, this);
			this.collection.on('reset', this.contactCollectionReset, this);
			this.on('load',this.load,this);
		},
		load: function(){
			this.collection.fetch();
		},
		contactAdded: function(contact){
			var contactHtml = (new ContactView({pid: this.pid, model: contact,removeButton:true})).render().el;
			$(contactHtml).appendTo('#contactlist').hide().fadeIn('slow');
		},

		contactCollectionReset: function(collection){
			var that = this;
			collection.each(function(contact){
				that.contactAdded(contact);
			});
		},

		render: function(){
			//增加 bottom Bar
			if($('.navbar-absolute-bottom').length == 0){
				var bottomBarView = new BottomBarView({
						id: this.pid,
						account: this.account,
						socketEvents: this.socketEvents,
						parentView: this,
					});
				$(bottomBarView.render().el).prependTo('.app');
				if(!$('body').hasClass('has-navbar-bottom')){
					$('body').addClass('has-navbar-bottom');
				}
			}
			this.$el.html(this.template({model:{_id: this.pid}}));
			return this;
		}

	});

	return ContactsView;
});