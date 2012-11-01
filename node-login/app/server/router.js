
var CT = require('./modules/country-list');
var AM = require('./modules/account-manager');
var EM = require('./modules/email-dispatcher');
var snmp = require('snmp-native');

module.exports = function(app) {

	console.log("router.js");

	// main login page //

	app.get('/', function(req, res){
	// check if the user's credentials are saved in a cookie //
		if (req.cookies.user == undefined || req.cookies.pass == undefined){
			res.render('login', { locals: { title: 'Hello - Please Login To Your Account' }});
		}	else{
	// attempt automatic login //
			AM.autoLogin(req.cookies.user, req.cookies.pass, function(o){
				if (o != null){
				    req.session.user = o;
					res.redirect('/ouvrir_porte');
				}	else{
					res.render('login', { locals: { title: 'Hello - Please Login To Your Account' }});
				}
			});
		}
	});
	
	app.post('/', function(req, res){
		AM.manualLogin(req.param('user'), req.param('pass'), function(e, o){
			if (!o){
				res.send(e, 400);
			}	else{
			    req.session.user = o;
				if (req.param('remember-me') == 'true'){
					res.cookie('user', o.user, { maxAge: 900000 });
					res.cookie('pass', o.pass, { maxAge: 900000 });
				}
				res.send(o, 200);
			}
		});
	});
	
// logged-in user homepage //
	
	app.get('/home', function(req, res) {
	    if (req.session.user == null){
	// if user is not logged-in redirect back to login page //
	        res.redirect('/');
	    }   else{
			res.render('home', {
				locals: {
					title : 'Control Panel',
					countries : CT,
					udata : req.session.user
				}
			});
	    }
	});
	
	app.post('/home', function(req, res){
		if (req.param('user') != undefined) {
			AM.update({
				user 		: req.param('user'),
				name 		: req.param('name'),
				email 		: req.param('email'),
				country 	: req.param('country'),
				pass		: req.param('pass')
			}, function(o){
				if (o){
					req.session.user = o;
			// udpate the user's login cookies if they exists //
					if (req.cookies.user != undefined && req.cookies.pass != undefined){
						res.cookie('user', o.user, { maxAge: 900000 });
						res.cookie('pass', o.pass, { maxAge: 900000 });	
					}
					res.send('ok', 200);
				}	else{
					res.send('error-updating-account', 400);
				}
			});
		}	else if (req.param('logout') == 'true'){
			res.clearCookie('user');
			res.clearCookie('pass');
			req.session.destroy(function(e){ res.send('ok', 200); });
		}
	});
	
// creating new accounts //
	
	app.get('/signup', function(req, res) {
		res.render('signup', {  locals: { title: 'Signup', countries : CT } });
	});
	
	app.post('/signup', function(req, res){
		AM.signup({
			name 	: req.param('name'),
			email 	: req.param('email'),
			user 	: req.param('user'),
			pass	: req.param('pass'),
			country : req.param('country')
		}, function(e, o){
			if (e){
				res.send(e, 400);
			}	else{
				res.send('ok', 200);
			}
		});
	});

// password reset //

	app.post('/lost-password', function(req, res){
	// look up the user's account via their email //
		AM.getEmail(req.param('email'), function(o){
			if (o){
				res.send('ok', 200);
				EM.dispatchResetPasswordLink(o, function(e, m){
				// this callback takes a moment to return //
				// should add an ajax loader to give user feedback //
					if (!e) {
					//	res.send('ok', 200);
					}	else{
						res.send('email-server-error', 400);
						for (k in e) console.log('error : ', k, e[k]);
					}
				});
			}	else{
				res.send('email-not-found', 400);
			}
		});
	});

	app.get('/reset-password', function(req, res) {
		var email = req.query["e"];
		var passH = req.query["p"];
		AM.validateLink(email, passH, function(e){
			if (e != 'ok'){
				res.redirect('/');
			} else{
	// save the user's email in a session instead of sending to the client //
				req.session.reset = { email:email, passHash:passH };
				res.render('reset', { title : 'Reset Password' });
			}
		})
	});
	
	app.post('/reset-password', function(req, res) {
		var nPass = req.param('pass');
	// retrieve the user's email from the session to lookup their account and reset password //
		var email = req.session.reset.email;
	// destory the session immediately after retrieving the stored email //
		req.session.destroy();
		AM.setPassword(email, nPass, function(o){
			if (o){
				res.send('ok', 200);
			}	else{
				res.send('unable to update password', 400);
			}
		})
	});
	
// view & delete accounts //
	
	app.get('/print', function(req, res) {
		AM.getAllRecords( function(e, accounts){
			res.render('print', { locals: { title : 'Account List', accts : accounts } });
		})
	});
	
	app.post('/delete', function(req, res){
		AM.delete(req.body.id, function(e, obj){
			if (!e){
				res.clearCookie('user');
				res.clearCookie('pass');
	            req.session.destroy(function(e){ res.send('ok', 200); });
			}	else{
				res.send('record not found', 400);
			}
	    });
	});
	
	app.get('/reset', function(req, res) {
		AM.delAllRecords( );
		res.redirect('/print');
	});

	app.get('/ouvrir_porte', function(req, res) {
		console.log("/ouvrir_porte");
	    if (req.session.user == null){
	// if user is not logged-in redirect back to login page //
			console.log("user not logged-in");
	        res.redirect('/');
	    }   else{
			console.log("user logged-in, ouvrir_porte");
			res.render('ouvrir_porte', {
				locals: {
					title : 'Ouverture de la porte',
					countries : CT,
					udata : req.session.user
				}
			});
	    }
	});

	app.post('/ouvrir_porte', function(req, res){
		// Create a Session with default settings.
		var session = new snmp.Session();
		// Create a Session with explicit default host, port, and community.
		var session = new snmp.Session({ host: '10.0.7.254', port: 161, community: 'private' });

		if (req.param('ouvrir') == 'true'){
			session.set({ oid: [1, 3, 6, 1, 4, 1, 8691, 10, 2260, 10, 2, 1, 4, 0], value: 1, type: 2 }, function (error, varbind) {
			if (error) {
				console.log('Fail :(');
				res.send('error-updating-account', 400);
			} else {
				console.log('The set is done.');
				res.send('ok', 200);
			}	
		});
		} else if (req.param('fermer') == 'true'){
			console.log('fermer');
			session.set({ oid: [1, 3, 6, 1, 4, 1, 8691, 10, 2260, 10, 2, 1, 4, 0], value: 0, type: 2 }, function (error, varbind) {
				if (error) {
					console.log('Fail :(');
					res.send('error-updating-account', 400);
					//console.log(error);
					//console.log(varbind);
				} else {
					console.log('The set is done.');
					res.send('ok', 200);
				}
			});
		}
	});


	app.get('*', function(req, res) { res.render('404', { title: 'Page Not Found'}); });

};
