var _ = require('underscore');
var $ = require('jquery'),
	Backbone = require('backbone'),
	indexTemplate = require('../templates/index.tpl'),
	ProjectItemView = require('../../ProjectItem'),
	ProjectCollection = require('../models/ProjectCollection');
var config = require('../conf');

Backbone.$ = $;

exports = module.exports = Backbone.View.extend({

	el: '#content',

	loaded: false,
	events: {
		'click .editor-toggle': 'editorToggle',
		'submit form': 'updateStatus'
	},

	initialize: function(options) {
		this.socketEvents = options.socketEvents;
		this.collection = new ProjectCollection();
		this.collection.url = config.api.host + '/accounts/me/projects';
		this.collection.on('add', this.onProjectAdded, this);
		this.collection.on('reset', this.onProjectCollectionReset, this);
		this.on('load', this.load, this);
	},

	load: function() {
		loaded = true;
		this.render();
		this.collection.fetch({
			xhrFields: {
				withCredentials: true
			},
			reset: true
		});
	},

	onProjectAdded: function(project) {
		var projectItemView = new ProjectItemView({
			model: project,
			socketEvents: this.socketEvents
		});
		var projectItemHtml = projectItemView.render().el;
		if (project.get('type') == 1) {
			this.$('.my-projects-none').remove();
			$(projectItemHtml).appendTo('.my-projects');
		} else {
			this.$('.other-projects-none').remove();
			$(projectItemHtml).appendTo('.other-projects');
		}
	},

	onProjectCollectionReset: function(collection) {
		var that = this;
		collection.each(function(project) {
			that.onProjectAdded(project);
		});
	},

	render: function() {
		this.$el.html(indexTemplate());
		return this;
	},
});