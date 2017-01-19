var mysql=require('mysql');
 
function connectServer(){

      var client=mysql.createConnection({
          host:'localhost',
          user: 'van',
          database:'test'
    }) 
     return client;
 }
 
 function user(user) {
	this.name = user.name;
	this.nickname = user.nickname;
	this.password = user.password;
 }

 function  selectuser(client, nickname, callback){
     client.query('select password from userinfo where nickname="'+nickname+'"',function(err,results,fields){
         if(err) throw err;
         callback(results);
    });
 }
  
 function selectname(client, nickname, callback){
     client.query('select password from userinfo where nickname="'+nickname+'"', function(err, results, fields){
     if(err) throw err;
     callback(results);
     });


 }

 function insertmessage(client, nickname, time, msg, callback){
      client.query('insert into messages (nickname, timestamp, message) value(?,?,?)', [nickname, time, msg], function(err,result){
         if( err ){
             console.log( "error:" + err.message);
            return err;
         }
           callback(err);
     });
 }
 
 function reloadmessage(client, callback) {
     client.query('select * from messages order by id', function(err, result){
     if(err){
	 console.log( "error:" + err.message);
         return err;
     }
     callback(result);
});

 }

 function insertuser(client, nickname, name, password,  callback){
     client.query('insert into userinfo value(?,?,?)', [name, nickname, password], function(err,result){
         if( err ){
             console.log( "error:" + err.message);
            return err;
         }
           callback(err);
     });
 }
 
 exports.connect = connectServer;
 exports.selectuser  = selectuser;
 exports.createuser = insertuser;
 exports.checkname = selectname;
 exports.addmessage = insertmessage;
 exports.reload = reloadmessage;
