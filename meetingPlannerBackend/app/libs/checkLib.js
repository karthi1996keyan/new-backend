
let trim=(value)=>
{
    let str=String(value);
    return str.replace(/^\s+|\s+$/,'');
}//end trim function

let isEmpty=(data)=>
{
    if(data === null || 
        data === undefined || 
        trim(data) === '' ||
        data.length === 0)
        {
            return true;
        }
        else
        {
            return false;
        }
}//end isempty function

module.exports=
{
    isEmpty:isEmpty,
    trim:trim
}