var express  = require('express'),
    requirejs = require('requirejs'),
    nodemailer = require('nodemailer'),
    request = require('request'),
    path     = require('path'),
    bodyParser = require('body-parser'),    
    fs = require('fs'),
    IpInfo = require("ipinfo"), 
    expressValidator = require('express-validator');
    app = express();

/*Set EJS template Engine*/
app.set('views','./views');
app.set('view engine','ejs');    

app.use(express.static(path.join(__dirname, '/public')));
app.use(bodyParser.urlencoded({ extended: true })); //support x-www-form-urlencoded
app.use(bodyParser.json());
app.use(expressValidator());

/*--------------------Require http server---------------------*/ 
var http = require('http'),
    port = 3000,
    handleRequest = require('./modules/handleRequest.js'),
    requestModifier = require('./modules/requestModifier.js');
    
/*--------------------start server----------------------------*/ 
var server = http.createServer(function(req, res){ 
    var res = requestModifier(res);
    handleRequest(req, res);    
    ////console.log(handleRequest)  
}); 


 
/*MySql connection*/
var connection  = require('express-myconnection'),
    mysql = require('mysql');

app.use(
    connection(mysql,{
        host     : 'localhost',
        user     : 'root',
        password : '',
        database : 'test',
        debug    : false //set true if you wanna see debug logger
    },'request')
);  

// will match requests to /index page
app.get('/index',function(req,res){  
  res.send('index');
  res.end();
});

// will match requests to /about page
app.get('/about', function (req, res) {
  res.send('about')
  res.end();
});

// will match requests to /dbase page
app.get('/dbase', function (req, res) {
  res.send('dbase')
  res.end();
});

// will match requests to /weather page
app.get('/weather', function (req, res) {     
  res.send('weather')
  res.end(); 
});

// will match requests to /contact page
app.get('/contact', function (req, res) {
  res.send('contact')
  res.end();
}); 

//RESTful route
var router = express.Router();

/*------------------------------------------------------
*  This is router middleware,invoked everytime
*  we click an anchor url /api and anything after /api
*  like /api/user , /api/user/7
*  we can use this for doing validation,authetication
*  for every route started with /api
--------------------------------------------------------*/
router.use(function(req, res, next) {
    console.log(req.method, req.url);
    next();
});

// will match requests to /index page
var index = router.route('/index');
index.get(function (req, res) {   
  res.render('index',{title:""});
  res.end(); 
});

// will match requests to /about page
var about = router.route('/about');
about.get(function (req, res) {
  //res.send('about')
  res.render('about',{title:""});
  res.end();
}); 
 
// will match requests to /dbase page
var dbase = router.route('/dbase'); 
dbase.get(function(req,res){

    req.getConnection(function(err,conn){

        if (err) return next("Cannot Connect");        

        var query = conn.query('SELECT * FROM t_user ORDER BY user_id',function(err,rows){ //LIMIT 0,4     
        
            if(err){
                console.log(err);
                return next("Mysql error, check your query");
            }
 
            res.render('dbase',{title:"",data:rows});

         });

    });

});
//post data to DB | POST
dbase.post(function(req,res, inputtxt){

    //validation
    req.assert('name','Name is required').notEmpty();
    req.assert('email','A valid email is required').isEmail();
    req.assert('phone','Phone is required').notEmpty();//.phonenumber(inputtxt);

    var errors = req.validationErrors();
    if(errors){
        res.status(422).json(errors);
        return;
    }

    //get data
    var data = {
        name:req.body.name,
        email:req.body.email,
        phone:req.body.phone
     };

    //inserting into mysql
    req.getConnection(function (err, conn){

        if (err) return next("Cannot Connect");

        var query = conn.query("INSERT INTO t_user set ? ",data, function(err, rows){

           if(err){
                console.log(err);
                return next("Mysql error, check your query");
           }

          res.sendStatus(200);

        });

     });

});


//now for Single route (GET,DELETE,PUT)
var dbase2 = router.route('/user/:user_id');

/*------------------------------------------------------
route.all is extremely useful. you can use it to do
stuffs for specific routes. for example you need to do
a validation everytime route /api/user/:user_id it hit.

remove curut2.all() if you dont want it
------------------------------------------------------*/
dbase2.all(function(req,res,next){
    console.log("You need to smth about curut2 Route ? Do it here");
    console.log(req.params);
    next();
});

//get data to update
dbase2.get(function(req,res,next){

    var user_id = req.params.user_id;

    req.getConnection(function(err,conn){

        if (err) return next("Cannot Connect");

        var query = conn.query("SELECT * FROM t_user WHERE user_id = ? ",[user_id],function(err,rows){

            if(err){
                console.log(err);
                return next("Mysql error, check your query");
            }

            //if user not found
            if(rows.length < 1)
                return res.send("User Not found");

            res.render('edit',{title:"Edit user",data:rows});
            res.end();
        });

    });

});

//update data
dbase2.put(function(req,res){
    var user_id = req.params.user_id;

    //validation
    req.assert('name','Name is required').notEmpty();
    req.assert('email','A valid email is required').isEmail();
    req.assert('phone','Phone is required').notEmpty();

    var errors = req.validationErrors();
    if(errors){
        res.status(422).json(errors);
        return;
    }

    //get data
    var data = {
        name:req.body.name,
        email:req.body.email,
        phone:req.body.phone
     };

    //inserting into mysql
    req.getConnection(function (err, conn){

        if (err) return next("Cannot Connect");

        var query = conn.query("UPDATE t_user set ? WHERE user_id = ? ",[data,user_id], function(err, rows){

           if(err){
                console.log(err);
                return next("Mysql error, check your query");
           }

          res.sendStatus(200);

        });

     });

});

//delete data
dbase2.delete(function(req,res){

    var user_id = req.params.user_id;

     req.getConnection(function (err, conn) {

        if (err) return next("Cannot Connect");

        var query = conn.query("DELETE FROM t_user  WHERE user_id = ? ",[user_id], function(err, rows){

             if(err){
                console.log(err);
                return next("Mysql error, check your query");
             }

             res.sendStatus(200);

        });
        console.log(query.sql);

     });
});      
 
//userCityState = 'vancouver'+', '+ 'wa'+'. '+ 'us';

IpInfo(function (err, cLoc) {
    //console.log(err || cLoc);
    //console.log(cLoc.city)
    //console.log(cLoc.region)
    //console.log(cLoc.country)
    //userCitySate =  cLoc.city +','+cLoc.region +' '+ cLoc.country;
    userLatLon= cLoc.loc
    /*
    // Get information about a known ip 
    IpInfo("8.8.8.8", function (err, cLoc) {
        console.log(err || cLoc);
 
        //Get organization 
        IpInfo("8.8.8.8/org", function (err, cLoc) {
            console.log(err || cLoc);
        });
    });

    console.log(userCitySate)
    */

    //var requestUrl = 'https://api.worldweatheronline.com/free/v2/weather.ashx?q=washington+dc+us&num_of_days=5&key=21b8b1946e7e17831878e52d604c5&tp=24&format=json';
    var requestUrl = 'https://api.worldweatheronline.com/free/v2/weather.ashx?q='+ userLatLon + '&num_of_days=5&key=21b8b1946e7e17831878e52d604c5&tp=24&format=json';
    function dayOfWeekAsString(dayIndex) {
        return ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"][dayIndex];
    } 
    
    // will match requests to /weather page
    var weather = router.route('/weather');   
    weather.get(function (req, res, userLatLon) { 
    
        request(requestUrl, function (error, response, body, userLatLon) {
            if (!error && response.statusCode == 200) {
            
                // parse the json result
               var result = JSON.parse(body);  
               
               cityState = cLoc.city +','+cLoc.region +' '+ cLoc.country;
               
               //cityState = 'Waugullewutlekauk' + ', '+ 'California' +'. '+ cLoc.country;
                                                       
               for (var i = 0; i < 1; i++) {
                           
               result.data.weather.forEach(function() {
               
               //console.log('day 1')           
               day0date = dayOfWeekAsString(new Date(result.data.weather[0].date).getDay())            
               day0MaxTempF = (result.data.weather[0].maxtempF)                   
               day0MinTempF =  (result.data.weather[0].mintempF)           
               day0MaxTempC = (result.data.weather[0].maxtempC)                   
               day0MinTempC =  (result.data.weather[0].mintempC)           
               day0weatherDesc = (result.data.weather[0].hourly[0].weatherDesc[0].value) 
               day0weatherIconUrl = (result.data.weather[0].hourly[0].weatherIconUrl[0].value) 
    
               //console.log('day 2')
               day1date = dayOfWeekAsString(new Date(result.data.weather[1].date).getDay())             
               day1MaxTempF = (result.data.weather[1].maxtempF)                   
               day1MinTempF =  (result.data.weather[1].mintempF)          
               day1MaxTempC = (result.data.weather[1].maxtempC)                   
               day1MinTempC =  (result.data.weather[1].mintempC)
               day1weatherDesc = (result.data.weather[1].hourly[0].weatherDesc[0].value) 
               day1weatherIconUrl = (result.data.weather[1].hourly[0].weatherIconUrl[0].value)  
    
               //console.log('day 3')           
               day2date = dayOfWeekAsString(new Date(result.data.weather[2].date).getDay())
               day2MaxTempF = (result.data.weather[2].maxtempF)                     
               day2MinTempF =  (result.data.weather[2].mintempF)
               day2MaxTempC = (result.data.weather[2].maxtempC)                   
               day2MinTempC =  (result.data.weather[2].mintempC)
               day2weatherDesc = (result.data.weather[2].hourly[0].weatherDesc[0].value) 
               day2weatherIconUrl = (result.data.weather[2].hourly[0].weatherIconUrl[0].value)          
                                               
               //console.log('day 4')
               day3date = dayOfWeekAsString(new Date(result.data.weather[3].date).getDay())                 
               day3MaxTempF = (result.data.weather[3].maxtempF)                   
               day3MinTempF =  (result.data.weather[3].mintempF)           
               day3MaxTempC = (result.data.weather[3].maxtempC)                   
               day3MinTempC =  (result.data.weather[3].mintempC)
               day3weatherDesc = (result.data.weather[3].hourly[0].weatherDesc[0].value) 
               day3weatherIconUrl = (result.data.weather[3].hourly[0].weatherIconUrl[0].value)             
                                   
               //console.log('day 5') 
               day4date = dayOfWeekAsString(new Date(result.data.weather[4].date).getDay())                 
               day4MaxTempF = (result.data.weather[4].maxtempF)                   
               day4MinTempF =  (result.data.weather[4].mintempF)
               day4MaxTempC = (result.data.weather[4].maxtempC)                   
               day4MinTempC =  (result.data.weather[4].mintempC)
               day4weatherDesc = (result.data.weather[4].hourly[0].weatherDesc[0].value) 
               day4weatherIconUrl = (result.data.weather[4].hourly[0].weatherIconUrl[0].value)   
    
               });
               
             };  
              
              res.render('weather',{title:"",data:result.data.weather});
            } else {
               console.log(error, response.statusCode, body);
            }
            res.end("");
        });       
    }) 
});

// will match requests to /contact page
var contact = router.route('/contact');
contact.get(function (req, res) {
  //res.send('about')
  res.render('contact',{title:""});
  res.end("");
});

/*--------------------email module start----------------------*/
 
/*
Here we are configuring our SMTP Server details.
STMP is mail server which is responsible for sending and recieving email.
*/ 
var smtpTransport = nodemailer.createTransport("SMTP",{
    service: "hotmail",
    auth: {
    port: 25,
    user: "ussteele@hotmail.com",
    pass: "Eleets2909"
    }
});

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/send',function(req,res){

    var mailOptions={
        name : req.query.senderName,       //senders name
        from : req.query.senderEmail,      //senders email 
        to : req.query.sendTo,             //send to email
        subject : req.query.emailSubject,  //email subject
        text : req.query.emailMessage   //email message    
        //html : req.query.emailMessage   //sender user agent 
    }
   
    ////console.log(mailOptions);
    
    smtpTransport.sendMail(mailOptions, function(error, response){
    if(error){
    //console.log(error);
    res.end("error");
    }else{
    console.log("Message sent: " + response.message);
    res.end("sent");
    }
    });
});

/*--------------------mail module Done----------------------------*/ 

//now we need to apply our router here
app.use('/api', router); 

/*--------------------server listen----------------------------*/
var server = app.listen(3000,function(){
   console.log("Listening to port %s",server.address().port); 
});

