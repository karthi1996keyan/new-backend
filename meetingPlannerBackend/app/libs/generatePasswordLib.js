const bcrypt=require('bcrypt');
const saltRounds=10;


let hashPassword=(myPassword)=>
{
    let salt=bcrypt.genSaltSync(saltRounds);
    let hash=bcrypt.hashSync(myPassword,salt);
    return hash;
}


let comparePassword=(oldpassword,newpassword,cb)=>
{
    bcrypt.compare(oldpassword,newpassword,(err,decoded)=>
    {
        if(err)
        {
            cb(err,null);
        }
        else
        {
            cb(null,decoded);
        }
    });//end compare function
}

module.exports=
{
    comparePassword:comparePassword,
    hashPassword:hashPassword
}