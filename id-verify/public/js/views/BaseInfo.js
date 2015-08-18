define(['text!templates/baseInfo.tpl','models/Person'], function(baseInfoTemplate,Person){
	var IdInfoView = Backbone.View.extend({
		el: '#content',
		template: _.template(baseInfoTemplate),
		events: {
			'submit form': 'baseInfo',
		},
		limits: {},
		initialize: function(options){
			this.id = options.id;
			this.account = options.account;
			this.model = new Person();
			this.on('load', this.load,this);
		},

		load: function(){
			var that = this;
			$.ajax('persons/times?type=base', {
				method: 'GET',
				success: function(data){
					var limits = data.account || {};
					var times = limits.times || -1;
					that.limits.times = times;
					var price = limits.price || 2;
					that.limits.price = price;
					that.render();
				}
			});
		},

		baseInfo: function(){
			var that = this;
			var card_id = this.$('input[name=card_id]').val();
			var card_name = this.$('input[name=card_name]').val();
			$.ajax('/persons/check?type=base', {
				method: 'POST',
				dataType: 'json',
				data: {
					persons: {
						card_id: card_id,
						card_name: card_name
					}
				},
				success: function(data){
					if(data.errcode){
						that.$('#result').html('错误消息：' + data.errmsg);
					}else{
						var limits = data.account || {};
						var times = limits.times || -1;
						if(times > 0){
							that.$('.times').html('您当前还可以查询 ' + times +' 条')
						}
						var person = data.persons[0] || {};
						that.model = new Person(person);
						that.render();
					}
				},
				error: function(){

				}
			});
			this.$('input[name=card_id]').val('');
			this.$('input[name=card_name]').val('');
			return false;
		},

		render: function(){
			this.$el.html(this.template({limits:this.limits,person: this.model.toJSON()}));
			if(this.limits.times > 0){
				this.$('.times').html('您当前还可以查询 ' + this.limits.times +' 条')
			}
			if(this.limits.price > 0){
				this.$('.price').html('<p>价格：' + this.limits.price + '.00 元/条</p>');
			}
			return this;
		}

	});

	return IdInfoView;
})