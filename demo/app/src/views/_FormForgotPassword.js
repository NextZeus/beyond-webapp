var _ = require('underscore');
var $ = require('jquery'),
	FormView = require('./__FormView'),
	ForgotPassword = require('../models/ForgotPassword');

var config = require('../conf');

exports = module.exports = FormView.extend({

	el: '#forgotPasswordForm',

	initialize: function(options) {
		this.model = new ForgotPassword();
		FormView.prototype.initialize.apply(this, options);
	},

	events: {
		'submit form': 'forgotPassword'
	},

	forgotPassword: function() {
		var that = this;
		//clean errors
		that.$('.form-group').removeClass('has-error');
		that.$('.form-group span.help-block').empty();
		//set model
		that.model.set('email', $('input[name=email]').val());

		if (that.model.isValid()) {
			var xhr = that.model.save(null, {
				xhrFields: {
					withCredentials: true
				},
			});
			if (xhr) {
				xhr
					.done(function(data) {
						if (!!data.code) {
							that.$('#error').html('<div class="alert alert-danger">' + data.errmsg + '</div>');
							that.$('#error').slideDown();
							return;
						}
						//update UI
						that.done();
					})
					.fail(function(xhr){
						that.$('#error').html('<div class="alert alert-danger">' + xhr.status + ': ' + xhr.responseText + '</div>');
						that.$('#error').slideDown();
					});
			}

		}
		return false;
	},
});