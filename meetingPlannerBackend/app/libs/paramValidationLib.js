let Email=(email)=>
{
    let regexEmail=/^\w+([\.-]*\w+)*@\w+([\.-]*\w+)*(\.\w{2,3})$/
    if(email.match(regexEmail))
    {
        return email;
    }
    else
    {
        return false;
    }
}//end email function

let Password=(password)=>
{
    let regexPassword=/^[A-Za-z0-9@#^&?$!%]{8,14}$/
    if(password.match(regexPassword))
    {
        
        return password
    }
    else
    {
        
        return false;
    }
}//end password function

module.exports=
{
    Email:Email,
    Password:Password
}