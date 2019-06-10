const jwt=require('jsonwebtoken');
const shortId=require('shortId');
const secretKey="SomeRandomStringThatCannotBeGuessbyAnyone";

//generate token
let generateToken=(data,cb)=>
{
    try
    {
        let claims=
        {
            jwtid:shortId.generate(),
            iat:Date.now(),
            exp:Math.floor(Date.now() / 1000) + (60*60*24),
            sub:'authToken',
            iss:'Meeting Planner',
            data:data
        }

        let tokenDetails=
        {
            token:jwt.sign(claims,secretKey),
            secretKey:secretKey
        }

        cb(null,tokenDetails);
    }
    catch(err)
    {
        cb(err,null);
    }
}//end generateToken

//compareToken
let compareToken=(token,secretkey,cb)=>
{
    jwt.verify(token,secretkey,(err,decodedData)=>
    {
        if(err)
        {
            cb(err,null);
        }
        else
        {
            cb(null,decodedData);
        }
    });
}//end compareToken

//compareTokenWithoutSecretKey
let compareTokenWithoutSecretKey=(token,cb)=>
{
    jwt.verify(token,secretKey,(err,decodedData)=>
    {
        if(err)
        {
            cb(err,null);
        }
        else
        {
            cb(null,decodedData);
        }
    }); 
}//compareTokenWithoutSecretKey

module.exports=
{
    generateToken:generateToken,
    compareToken:compareToken,
    compareTokenWithoutSecretKey:compareTokenWithoutSecretKey
}