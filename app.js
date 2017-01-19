var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var ejs = require('ejs');
var bodyParser = require('body-parser');  
var db = require(__dirname + '/database'); 
var jsonParser = bodyParser.json()     
var urlencodedParser = bodyParser.urlencoded({ extended: false })

app.set('views', path.join(__dirname, 'views'));
app.engine('.html', ejs.__express);
app.set('view engine', 'html');


app.get('/', function(req, res){
  res.render('login', {error:'Welcome!'});
});


app.post('/login', urlencodedParser, function(req, res){
    var errormsg = 'password and nickname is required!';
    var errormsg2 = 'password is not correct!';
    if (!req.body.name || !req.body.password) return res.render('login', {error:errormsg});  
    var nickname = req.body.name;
    var client = db.connect();
    var result = null;
    db.selectuser(client, nickname, function(result){
    if(result[0].password===req.body.password){
	res.render('index', {name:nickname});
    } else {
	res.render('login', {error:errormsg2});
    }
    })
});

app.post('/regi', urlencodedParser, function(req, res){
    var client = db.connect();
    if (!req.body.name || !req.body.password || !req.body.nickname) return res.render('register', {error:'all fields are required!'});

    db.checkname(client, req.body.nickname, function(result){
    if(result != null){
    var errormsg = 'nickname already exits!';
    res.render('register', {error:errormsg});
    return;
    }
    });

    db.createuser(client, req.body.name, req.body.nickname, req.body.password, function(err){
    if(err) throw err;
    res.render('login', {error:'Welcome!'});
    });
});

app.get('/logout', function(req, res){
    res.render('login', {error:'Welcome!'});
});

app.get('/regi', function(req, res){
    res.render('register', {error:'welcome!'});
});


io.sockets.on('connection', function (socket) {
        socket.on('join', function (user) {
            socket.user = user;
            var client = db.connect();
            db.reload(client, function(result){
            socket.emit('state', user, result);
            }); 
            socket.broadcast.emit('online', user);
        });
        socket.on('sendMSG', function (msg) {
            var client = db.connect();
            var nickname = socket.user;
            var myDate = new Date();
            var time = myDate.toLocaleString();
            db.addmessage(client, nickname, time, msg, function(err){
            if(err) throw err;
	    });
            socket.emit('chat', nickname, msg);
            socket.broadcast.emit('chat', nickname, msg);
        });
         socket.on('logout', function (user) {
            socket.emit('out', user);
            socket.broadcast.emit('out', user);
        });

    });

http.listen(3000, function(){
  console.log('listening on *:3000');
});
