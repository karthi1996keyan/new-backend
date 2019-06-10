const express=require('express');
const app=express();
const http=require('http');
const mongoose=require('mongoose');
const fs=require('fs');
const appConfig=require('./config/appConfig'); 
const bodyParser=require('body-parser');
const morgan=require('morgan');

//libs
const loggerLib=require('./app/libs/loggerLib');

//end libs 

//middlewares
const routeLogger=require('./app/middlewares/routeLogger');
const appErrHandler=require('./app/middlewares/appErrorHandler');

// app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(routeLogger.logIp);
app.use(appErrHandler.globalErrorHandler);
/**
 * cors config
 */
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
    next();
});//end cors config

/**
 * models
 */
let modelPath='./app/models';
 fs.readdirSync(modelPath).forEach(function(file)
 {
    if(~file.indexOf('.js'))
    {
        require(modelPath+'/'+file);
    }
 });//end models

 /**
  * routes
  */
 let routePath='./app/routes';
 fs.readdirSync(routePath).forEach(function(file)
 {
    if(~file.indexOf('.js'))
    {
        let route=require(routePath+'/'+file);
        route.setRoute(app);
    }
 });

 app.use(appErrHandler.globalNotFoundHandler);

/**
 * create server using http module
 * listening server
 */

const server=http.createServer(app);
console.log(appConfig);
server.listen(appConfig.port);
server.on('error',onError);
server.on('listening',onListening);
//end listening server code

//socket 

const socket=require('./app/libs/socket');
socket.setServer(server);

/**
 * handling server error
 */


 function onError(error)
 {
     if(error.syscall != 'listen')
     {
        loggerLib.captureError(error.code+'Syscall is not listening','ServerErrorHandler',10);
        throw error;
     }

     switch(error.code)
     {
         case 'EACCES':
            loggerLib.captureError(error.code+'Elevated Priveleges is missing','ServerErrorHandler',10);
            process.exit(1);
            break;
         case 'EADDRINUSE':
            loggerLib.captureError(error.code+'Port is already in user','ServerErrorHandler',10);
            process.exit(1);
            break;
         default:
            loggerLib.captureError(error.code+'Some unknown erro occured','ServerErrorHandler',10);  
            throw error;      
     }
 } //end server err handler

 /**
  * event handler for listening event
  */

  function onListening()
  {
      let addr=server.address();
      let bind=typeof addr === 'string' ? 'pipe'+addr : 'port '+ addr.port;
      loggerLib.captureInfo('Server is Listening on '+bind,'EventListeningHandler',10);
      
      let db=mongoose.connect(appConfig.databaseUrl,{useNewUrlParser:true,useCreateIndex:true});
  }

  process.on('unhandledRejection',(reason,p)=>
  {
    loggerLib.captureError('UnhandledRejection at : promise '+p+' Reason : '+reason,'unhandledRejectionhandler',10);
  });

  mongoose.connection.on('error',function(error)
  {
        loggerLib.captureError(err,'mongoose connection error handler',10);
  });//end mongoose error handler

  mongoose.connection.on('open',function(err)
  {
    if(err)
    {
        loggerLib.captureError(err,'mongoose connection open handler',10);
    }
    else
    {
        loggerLib.captureInfo('Database connection established successfully','mongoose connection error handler',10);
    }
  });//end mongoose open handler