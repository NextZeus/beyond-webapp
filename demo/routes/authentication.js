module.exports = exports = function(app,models){
	var Account = models.Account;
	
	app.post('/register',function(req,res){
		var firstName = req.body.firstName || '';
		var lastName = req.body/lastName || '';
		var email = req.body.email;
		var password = req.body.password;

		if(null == email || email.length<1 || null == password || password.length<1){
			res.sendStatus(400);
			return;
		}
		Account.register(email,password,firstName,lastName);
		res.sendStatus(200);
	});

	app.post('/login',function(req,res){
		var email = req.body.email;
		var password = req.body.password;

		if(null == email || email.length<1 || null == password || password.length<1){
			res.sendStatus(400);
			return;
		}
		Account.login(email,password,function(account){
			if(!account){
				res.sendStatus(401);
				return;
			}
			console.log(email + ': login sucessfully.');
			req.session.loggedIn = true;
			req.session.accountId = account._id;
			req.session.name = account.name;
			res.sendStatus(200);
		});
	});

	app.get('/logout', function(req,res){
		delete req.session.loggedIn;
		console.log(req.session.accountId + ': logout sucessfully.');
		res.sendStatus(200);
	});

	app.post('/forgotPassword',function(req,res){
		var email = req.body.email;
		if(null == email || email.length<1){
			res.sendStatus(400);
			return;
		}
		var hostname = req.header.host;
		var resetPasswordUrl = 'http://' + hostname + '/resetPassword';
		Account.forgotPassword(email, resetPasswordUrl,function(success){
			if(!success){
				res.sendStatus(404);
				return;
			}
			res.sendStatus(200);
		});
		res.sendStatus(200);
	});

	app.get('/resetPassword',function(req,res){
		var accountId = req.param('account', null);
		res.render('resetPassword.jade',{locals: {accountId: accountId}});

	});

	app.post('/resetPassword',function(req,res){
		var accountId = req.body.accountId;
		var password = req.body.password;
		if(null != accountId && null != password){
			Account.resetPassword(accountId,password);
		}
		res.render('resetPasswordSucess.jade');
	});

	app.get('/account/authenticated', function(req,res){
		if(req.session.loggedIn){
			res.sendStatus(200);
		}else{
			res.sendStatus(401);
		}
	});
};