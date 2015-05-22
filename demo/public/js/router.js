define(['views/Index','views/Register','views/Login','views/ForgotPassword','views/Profile','views/Contacts','views/AddContact','views/ChatUsers','models/Account','models/StatusCollection','models/ContactCollection'], function(IndexView,RegisterView,LoginView,ForgotPasswordView,ProfileView,ContactsView,AddContactView,ChatUsersView,Account,StatusCollection,ContactCollection){

	var SocailRouter = Backbone.Router.extend({
		currentView : null,
		socketEvents: _.extend({},Backbone.Events),
		routes: {
			'index': 'index',
			'login': 'login',
			'register': 'register',
			'forgotpassword': 'forgotPassword',
			'profile/:id': 'profile',
			'contacts/:id': 'contacts',
			'addcontact': 'addContact'
		},
		changeView: function(view){
			if(null != this.currentView){
				this.currentView.undelegateEvents();
			}
			this.currentView = view;
			this.currentView.render();
		},
		index: function(){
			var statusCollection = new StatusCollection();
			statusCollection.url = '/accounts/me/activity';
			this.changeView(new IndexView({collection: statusCollection,socketEvents: this.socketEvents}));
			statusCollection.fetch();


			// var contactCollection = new ContactCollection();
			// contactCollection.url = '/accounts/me/contacts';
			// new ChatUsersView({
			// 		collection:contactCollection,
			// 		socketEvents: this.socketEvents
			// 	}).render();
			// contactCollection.fetch({reset: true});

		},
		register: function(){
			this.changeView(new RegisterView());
		},
		login: function(){
			this.changeView(new LoginView({socketEvents: this.socketEvents}));
		},
		forgotPassword: function(){
			this.changeView(new ForgotPasswordView());
		},
		profile: function(id){
			var account = new Account({id: id});
			this.changeView(new ProfileView({model: account,socketEvents: this.socketEvents}));
			account.fetch();
		},
		contacts: function(id){
			var contactId = id ? id: 'me';
			var contactCollection = new ContactCollection();
			contactCollection.url = '/accounts/' + contactId + '/contacts';
			this.changeView(new ContactsView({collection: contactCollection}));
			contactCollection.fetch();
		},
		addContact: function(){
			this.changeView(new AddContactView());
		}
	});

	return new SocailRouter();
});