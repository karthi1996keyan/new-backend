const mongoose=require('mongoose');
const jwt=require('jsonwebtoken');
const authModel=mongoose.model('authModel');
const loggerLib=require('./../libs/loggerLib');
const responseLib=require('../libs/responseLib');
const tokenLib=require('../libs/tokenLib');
const check=require('../libs/checkLib');

let isAuthorized=(req,res,next)=>
{
    console.log(req.body);
    if(req.params.authToken || req.query.authToken || req.body.authToken || req.header('authToken'))
    {
        authModel.findOne({authToken: req.header('authToken') || req.params.authToken || req.body.authToken || req.query.authToken})
        .exec(

            (err,tokenDetails)=>
            {
                if(err)
                {
                    loggerLib.captureError(err.message,'AuthMiddleware',10);
                    let apiresponse=responseLib.generate(true,'Failed to authorized',500,null);
                    res.send(apiresponse);
                }
                else if(check.isEmpty(tokenDetails))
                {
                    loggerLib.captureError('Invalid or expired authorizationKey','AuthMiddleware',10);
                    let apiresponse=responseLib.generate(true,'Invalid or expired authorizationKey',404,null);
                    res.send(apiresponse);
                }
                else
                {
                   tokenLib.compareToken(tokenDetails.authToken,tokenDetails.secretKey,(err,details)=>
                       {
                         if(err)
                         {
                            loggerLib.captureError(err.message,'AuthMiddleware',10);
                            let apiresponse=responseLib.generate(true,'Failed to authorized',500,null);
                            res.send(apiresponse);
                         } 
                         else
                         {
                             req.user=
                             {
                                 userId:details.data.userId
                             }
                             next();
                         }
                       }
                   ) 
                }
            }
        )
    }
    else
    {
        loggerLib.captureError('AuthorizationToken is missing','AuthMiddleWare',10);
        let apiresponse=responseLib.generate(true,'AuthorizationToken is missing',404,null);
        res.send(apiresponse);
    }
}

module.exports=
{
isAuthorized:isAuthorized
}