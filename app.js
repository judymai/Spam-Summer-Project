var login = require('./authen');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');

var app = express();

app.use(session({secret: 'ssshhhhh'}));
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());


app.set('view engine','jade');

var sess;

//Home page
app.get('/',function(req,res){
    sess = req.session
    if(sess.user)
	res.render('index',{title: 'Hey',message: 'Hello World!', greeting: 'You are logged in as ', user: sess.user});
    else
	res.render('index',{title: 'Hey',message: 'Hello World!', greeting: 'Welcome guest!'});
	
});

//Login page
app.route('/login')
    .get(function(req,res){
	sess = req.session;
	if(sess.user)
	    res.redirect('/');
	else
	    res.render('login',{title: 'Login',message: 'Enter your info to login'});
    })
    .post(function(req,res){
	sess = req.session;
	//Authenicate the user
	login.authenicate(req.body.user,req.body.pass,function(auth){
	    //If the user is found, add them to the session and redirect to homepage
	    if(auth){
		sess.user = req.body.user;
		res.redirect('/');
	    }
	    else{
		//TODO: show error message on login page
		console.log("Invalid user/pass combo");
	    }
	})
    });

//Register page
app.route('/register')
    .get(function(req,res){
	sess = req.session;
	if(sess.user)
	    res.redirect('/');
	else
	    res.render('register',{title: 'Register',message: 'Register here'});
    })
    .post(function(req,res,callback){
	//Check if the username is taken
	login.existsuser(req.body.user,req.body.pass,function(userExists){
	    if(userExists)
		//TODO: Show error message on register page
		console.log("User already exists");
	    else{
		//If the user does not exist, add them to the database,
		//log them in, and redirect to homepage
		login.adduser(req.body.user,req.body.pass,function(added){
		    sess = req.session;
		    sess.user = req.body.user;
		    res.redirect('/');	
		});
	    }
	});
    })
	

app.route('/logout')
    .get(function(req,res){
	req.session.destroy(function(err){
	    if(err){
		console.log(err);
	    }
	    else{
		res.redirect('/');
	    }
	});
    });
	    
	    

var server = app.listen(3000,function(){
    var host = server.address().address;
    var port = server.address().port;
    console.log("Example app listening at http://%s:%s",host,port);

});


