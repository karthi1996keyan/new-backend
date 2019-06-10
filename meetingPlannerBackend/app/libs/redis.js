 const checkLb=require('../libs/checkLib');

 const redis=require('redis');

 let client=redis.createClient(
     {
         port:'19923',
         host:'redis-19923.c80.us-east-1-2.ec2.cloud.redislabs.com',
         password:'EDXnQrtRCyhT7Iio5mahon5DYyKXNTCt'
     }
 )


 client.on('connect',()=>
 {
    console.log('redis connection established');
 });


let getAllUserInHash=(hashName,cb)=>
{
    client.HGETALL(hashName,(err,result)=>
    {
        if(err)
        {
            console.log(err);
            cb(err,null);
        }
        else if(checkLb.isEmpty(result))
        {
            console.log('Online user is empty');
            cb(null,{});
        }
        else
        {
            cb(null,result);
        }
    
    });//end HGETALL

};//END get ALL USER LIST


let setOnlineNewUsers=(hashName,key,value,cb)=>
{
    client.HMSET(hashName,[key,value],(err,result)=>
    {
        if(err)
        {
            cb(err,null);
        }
        else{
            cb(null,result);
        }
    });

}//end set user


let deleteUseFromHash=(hashName,key)=>
{
    client.HDEL(hashName,key);
    return true;
}


module.exports=
{
    deleteUseFromHash:deleteUseFromHash,
    getAllUserInHash:getAllUserInHash,
    setOnlineNewUsers:setOnlineNewUsers
}

