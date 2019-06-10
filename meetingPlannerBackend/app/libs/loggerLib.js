const logger=require('pino')();
const moment=require('moment');
/**
 *  Capture error logs using pino module
 */

 let captureError=(errorMessage,errorOrgin,errorLevel)=>
 {  

     let timestamp=moment.utc();
     let errorResponse=
     {
         errorMessage:errorMessage,
         errorOrgin:errorOrgin,
         errorlevel:errorLevel,
         timestamp:timestamp
     }

     logger.error(errorResponse);
  
 } //end capture error

 /**
 *  Capture info logs using pino module
 */
let captureInfo=(infoMessage,infoOrgin,infoLevel)=>
{
    let timestamp=moment.utc();

    let infoResponse=
    {
        infoMessage:infoMessage,
        infoOrgin:infoOrgin,
        infoLevel:infoLevel,
        timestamp:timestamp
    }
    logger.info(infoResponse);
}//end capture info


module.exports=
{
    captureError:captureError,
    captureInfo:captureInfo
}