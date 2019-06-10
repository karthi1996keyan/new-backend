/**
 * standardise all responses
 */
let generate=(err,message,status,data)=>
{
    let response=
    {
        err:err,
        message:message,
        status:status,
        data:data
    }
    return response;
    
}//end generate function

module.exports=
{
    generate:generate
}
