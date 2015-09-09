var _ = require('underscore');
var $ = require('jquery'),
    Backbone = require('backbone'),
    chatItemTemplate = require('../../assets/templates/_itemChat.tpl'),
    chatItemImageTemplate = require('../../assets/templates/_itemChatImage.tpl'),
    MessageUtil = require('./__Util');

Backbone.$ = $;

exports = module.exports = Backbone.View.extend({

	tagName: 'div',

	initialize: function(){
		this._convertStatus();
	},

	_convertStatus: function(){
		var statusObject = this.model.get('status');
		if(!statusObject){
			return;
		}
		if(typeof statusObject == 'string'){
			var statusString = statusObject.trim();
			var newString = '';
			if(!/^http/.test(statusString)){
				newString += statusString;
			}else{
				if(/^http.*(png|jpg|git)$/.test(statusString)){
					newString += '<img src="' + statusString +'" target-data="'+ statusString +'" target-type="image">';
				}else if(/^http.*(mp4|mov)$/.test(statusString)){
				}else if(/^http.*(mp3|amr)$/.test(statusString)){

				}else if(/[pdf]$/.test(statusString)){
					newString += '<a href="' + statusString + '">';
					newString += '<img src="images/pdf.png" target-data="'+ statusString +'" target-type="pdf">';
					newString += '</a>'; 
				}else{
					newString += '<a href="' + statusString + '">';
					newString += '<img src="images/unknown.png" target-data="'+ statusString +'" target-type="unknown">';
					newString += '</a>'; 
				}
			}
			this.model.set('status', newString);
		}else{
			var newStatus = '';
			if(statusObject.MsgType == 'text'){
				newStatus += '<p>' + statusObject.Content + '</p>';
			}else if(statusObject.MsgType == 'image'){ 
				if(statusObject.PicUrl){
					newStatus += '<p><img src="' + statusObject.PicUrl + '">';	
				}
			}else if(statusObject.MsgType == 'mixed'){
				newStatus += '<p>' + statusObject.Content + '</p>';
				for(var i=0; i<statusObject.Urls.length; i++){
					if(/[png|jpg]$/.test(statusObject.Urls[i])){
						newStatus += '<img src="' + statusObject.Urls[i] +'" width="' + parseInt(50/statusObject.Urls.length-1) +'%" target-data="'+ statusObject.Urls[i] +'" target-type="image">';
					}else if(/[pdf]$/.test(statusObject.Urls[i])){
						newStatus += '<a href="' + statusObject.Urls[i] + '">';
						newStatus += '<img src="images/pdf.png" target-data="'+ statusObject.Urls[i] +'" target-type="pdf">';
						newStatus += '</a>'; 
					}
				}
			}else if(statusObject.MsgType == 'link'){
				newStatus += '<a href="' + statusObject.Url + '">';
				newStatus += '<h4>' +statusObject.Title + '</h4>';
				newStatus += '<p>'+ statusObject.Description + '</p>';
			}
			this.model.set('status', newStatus);
		}
	},

	render: function(){
		var content = this.model.get('status');
		if(typeof content =='string'){
			this.$el.addClass('textType');
			this.$el.html(chatItemTemplate(this.model.toJSON()));
		}else{
			if(content.MsgType == 'image'){
				this.$el.addClass('imageType');
				this.$el.html(chatItemImageTemplate(this.model.toJSON()));
			}
		}
		return this;
	}
});