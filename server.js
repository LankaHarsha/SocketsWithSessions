var express = require('express'),
	session = require('express-session'),
	mongoStore = require('connect-mongo')(session),
	cookieParser = require('cookie-parser'),
	bodyParser = require('body-parser'),
	morgan = require('morgan'),
	mongoose = require('mongoose'),
	Promise = require('bluebird'),
	app = express(),
	http = require('http').createServer(app); //Requiring http module to create httpserver and passed app to work with functions defined in "express"
	io = require('socket.io')(http);//Socket's need http to listen socket connection at clientside
	Schema = mongoose.Schema;
	port = process.env.PORT || 8000;


var sessionStore = new mongoStore({
	url : 'mongodb://localhost:27017/USER_INFO',
	autoRemove : 'interval',
	autoRemoveInterval : 15
})
//Application level configuartions
app.use(express.static(__dirname + '/public'));	
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(session({
	name: '__sessionApp',
	secret: 'superrr',
	saveUninitialized: true,
	store: sessionStore
}))
Promise.promisifyAll(mongoose);

//Middle Wares

function hasAuthentication(req,res,next) {

	if(req.session && req.session.user) {

		next();
	}else {

		res.statusCode = 401;
		res.end();
	}
}

//Restful Api's
app.post('/login', function(req, res) {

	if(req.session && !req.session.user){

		userModel.findOneAsync({email:req.body.Email, password:req.body.pwd}).then(function(user) {
			
			console.log(user);
			if(user) {

				req.session.user = user.email;
				res.json({
					status: "S",
					data: user
				});
			}else {
				res.statusCode = 401;
				res.end();
			}		
		}).catch(function(err) {

			res.statusCode = 500;
			res.end();
		})
	}
});

app.get('/verify', hasAuthentication, function(req,res) {

	res.json({
		status:'S',
		data:req.session.user
	})
});


/************************************* DB RELATED - START *********************************/
var mongoURL = "mongodb://localhost:27017/USER_INFO"

var userSchema = new Schema({
	email: {type: String, unique: true},
	password: {type: String}
});

var sessionSchema = new Schema({
	_id: {type: String},
	session: {type: String},
	expires: {type: String}
})

var userModel = mongoose.model('User',userSchema,'users');
var sessionModel = mongoose.model('Session',sessionSchema,'sessions');

/************************************* DB RELATED - END ***********************************/
// Application running on port
http.listen(port, function() {

	console.log("Http Server is running on port" + port);
});

mongoose.connect(mongoURL, function(err) {

	if(err) {

		console.log("Can't Connect to db server"+err);
	}
	else {

		console.log("Mongodb Connected to :: "+ mongoURL);
	}
})


/****************************** Socket Functionalities - START ***************************/
io.use(function(client, next) {

	console.log(client);
	var _cParser = cookieParser('superrr');
	var req = client.handshake;
	var res = {};
	_cParser(req, res, function(err, data) {

		if(err) {
			console.log("This is error at socket sessions");
			return next(err);
		}
		console.log("This is request");
		var session = req.signedCookies['__sessionApp'];
		sessionModel.findOneAsync({_id:session}).then(function(result) {

			var userSession = JSON.parse(result.session);
			userSession['sessionId'] = session;
			client._session = userSession;
			next();
		})
	})

});
var socketMap = {};

io.on('connection', function(client) {

	console.log("Socket Connected--");
	console.log(client);
	if(client._session){
		var sessionId = client._session.sessionId
		if(!socketMap[sessionId]) {

			socketMap[sessionId] = [];
			socketMap[sessionId].push(client.id);
		}else {
			socketMap[sessionId].push(client.id);
		}
		client.emit('message',{message:'You are authorized user',user:client._session.user});
	}else {
		client.emit('message', {message:'You are invalid user',user:null});
	}

	socketMap[sessionId].map(function(id) {
		io.to(id).emit('groupMessage', client._session.user);
	})
})

/****************************** Socket Functionalities - END   ***************************/