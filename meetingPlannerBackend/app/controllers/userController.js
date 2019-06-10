const mongoose=require('mongoose');
const shortId=require('shortid');
const response=require('../libs/responseLib');

const logger=require('../libs/loggerLib');
const tokenLib=require('../libs/tokenLib');
const paramsValidationLib=require('../libs/paramValidationLib');
const checkLib=require('../libs/checkLib');
const timeLib=require('../libs/timeLib')
const generatePasswordLib=require('../libs/generatePasswordLib');
const emailLib=require('../libs/emailLib');

const userModel=mongoose.model('userModel');
const authModel=mongoose.model('authModel');


var appUrl="http://meetinplanner.xyz" //url of front end application
/**
 * signup function
 * @param {String} firstName 
 * @param {String} lastName 
 * @param {String} mobileNumber 
 * @param {String} email 
 * @param {String} password 
 * @param {String} countryName 
 */

let signUpFunction=(req,res)=>
{

    /**
     *  validate user input
     **/ 
    let validateUserInput=()=>
    {
        return new Promise((resolve,reject)=>{
            
            if(req.body.email)
            {
                if(!paramsValidationLib.Email(req.body.email))
                {
                    logger.captureError('Email does not met the requirement','UserController:SignupFunction():validateUserInput()',5);
                    let apiresponse=response.generate(true,'Email does not met the requirement',400,null);
                    reject(apiresponse);
                }
                else  if(!paramsValidationLib.Password(req.body.password))
                {
                    logger.captureError('Password does not met the requirement','UserController:SignupFunction():validateUserInput()',5);
                    let apiresponse=response.generate(true,'Password does not met the requirement',400,null);
                    reject(apiresponse);
                }
                else if(checkLib.isEmpty(req.body.password))
                {
                    logger.captureError('Password is missing','UserController :SignupFunction() :validateUserInput()',5);
                    let apiresponse=response.generate(true,'Password is missing',404,null);
                    reject(apiresponse);
                }
                else 
                {
                    resolve(req);
                }

            }
            else
            {
                logger.captureError('Field missing while creating user','UserController:SignupFunction():validateUserInput()',5);
                let apiresponse=response.generate(true,'one or more parameter(s) is missing',404,null);
                reject(apiresponse);
            }
        });// end promise
    } //end validate user input

    /**
     * check user is already present or not 
     * create User
     */

     let createUser=()=>
     {
         return new Promise((resolve,reject)=>
         {
            userModel.findOne({email:req.body.email})
            .exec((err,userDetails)=>
            {
                if(err)
                {
                    logger.captureError(err.message,'UserController : SignupFunction():createUser()',10);
                    let apiresponse=response.generate(true,'Failed to create user',500,null);
                    reject(apiresponse);
                }
                else if(checkLib.isEmpty(userDetails))
                {
                    let newUser=new userModel(
                        {
                             userId:shortId.generate(),
                             firstName:req.body.firstName,
                             lastName:req.body.lastName,
                             userName:req.body.userName,
                             isAdmin:req.body.isAdmin,
                             countryName:req.body.countryName,
                             mobileNumber:req.body.mobileNumber,
                             email:req.body.email.toLowerCase(),
                             password:generatePasswordLib.hashPassword(req.body.password),
                             createdOn:timeLib.now()
                        }
                    );//end newuser

                    newUser.save((err,successData)=>
                    {
                        if(err)
                        {
                            logger.captureError(err.message,'UserController : SignupFunction():createUser()',10);
                            let apiresponse=response.generate(true,'Failed to create user',500,null);
                            reject(apiresponse);
                        }
                        else
                        {
                            let newObj=successData.toObject();

                            delete newObj.password;
                            delete newObj.__v;
                            delete newObj._id;
                            delete newObj.createdOn;

                            let sendMailDetails=
                            {
                                email:newObj.email,
                                subject:"Meeting Planner - Verify Email",
                                html:` <b>Dear ${newObj.userName},</b>
                                <br>
                                <br>
                                <i>Welcome to our meeting planner app </i>
                                <br>
                                Please verify your account using below link
                                <br>
                                <a href="${appUrl}/verify-email/${newObj.userId}">
                                Click Here
                                </a>`
                            }

                            setTimeout(()=>
                            {
                                    emailLib.sendEmail(sendMailDetails);
                            },2000)

                            resolve(newObj);
                        }

                    });

                }
                else
                {
                    logger.captureError('user already present','UserController : SignupFunction():createUser()',5);
                    let apiresponse=response.generate(true,'User Already Registered',403,null);
                    reject(apiresponse);
                }

            });//end usermodel find   

         }); //end return promise

     }//end create user


     validateUserInput(req,res)
     .then(createUser)
     .then(
      (successData)=>
         {
             let apiresponse=response.generate(false,'User Created Successfully',200,successData);
             res.send(apiresponse);
         }
     )
     .catch((errResponse)=>
     {
        res.send(errResponse);
     });



}//end signup function


/**
 * login function
 * @param {String} email 
 * @param {String} password 
 */
let loginFunction=(req,res)=>
{
      /**
     *  validate user input
     **/ 
    let validateUserInput=()=>
    {
        return new Promise((resolve,reject)=>{
            
            if(req.body.email)
            {
                if(!paramsValidationLib.Email(req.body.email))
                {
                    logger.captureError('Email does not met the requirement','UserController:loginFunction():validateUserInput()',5);
                    let apiresponse=response.generate(true,'Email does not met the requirement',400,null);
                    reject(apiresponse);
                    
                }
                else if(checkLib.isEmpty(req.body.password))
                {
                    logger.captureError('Password is missing','UserController :loginFunction() :validateUserInput()',5);
                    let apiresponse=response.generate(true,'Password is missing',404,null);
                    reject(apiresponse);
                }
                else 
                {
                    resolve(req);
                }

            }
            else
            {
                logger.captureError('Field missing while creating user','UserController:loginFunction():validateUserInput()',5);
                let apiresponse=response.generate(true,'one or more parameter(s) is missing',404,null);
                reject(apiresponse);
            }
        });// end promise
    } //end validate user input

    //find user
    let findUser=()=>
    {
        
        return new Promise((resolve,reject)=>
        {
            userModel.findOne({email:req.body.email})
            .exec(
                (err,userdata)=>
                {
                    if(err)
                    {
                        logger.captureError('Failed to find user details','UserController:loginFunction():findUser()',10);
                        let apiresponse=response.generate(true,'Failed to find userDetails',500,null);
                        reject(apiresponse);
                    }
                    else if(checkLib.isEmpty(userdata))
                    {
                        logger.captureError('User Not Registered','UserController:loginFunction():findUser()',5);
                        let apiresponse=response.generate(true,'User Not Registered',404,null);
                        reject(apiresponse);
                    }
                    else if(userdata.emailVerified == 'no')
                    {
                        logger.captureError('Email is not verified','UserController:loginFunction():findUser()',5);
                        let apiresponse=response.generate(true,'Email is not verified .Please check mail',400,null);
                        reject(apiresponse);
                    }
                    else
                    {
                        let newObj=userdata.toObject();
                        resolve(newObj);
                    }

                }
            )
        });//end new promise
    }//end find user

    //validatePassword
    let validatePassword=(userDetails)=>
    {
        
        return new Promise((resolve,reject)=>
        {
            generatePasswordLib.comparePassword(req.body.password,userDetails.password,(err,data)=>
            {
                if(err)
                {
                    logger.captureError('Failed to validate password','UserController:loginFunction():ValidatePassword()',5);
                    let apiresponse=response.generate(true,'Failed to validate password',500,null);
                    reject(apiresponse);
                }
                else if(data)
                {
                    delete userDetails.password;
                    delete userDetails.__v;
                    delete userDetails._id;
                    delete userDetails.createdOn;
                    resolve(userDetails);
                }
                else
                {
                    logger.captureError('Invalid password login failed','UserController:loginFunction():ValidatePassword()',5);
                    let apiresponse=response.generate(true,'Wrong Password .Login Failed',400,null);
                    reject(apiresponse);
                }
            });
        });
    }//end validate password

    //generate token
    let generateToken=(retrievedUserDetails)=>
    {
        
        return new Promise(
            (resolve,reject)=>
            {
                tokenLib.generateToken(retrievedUserDetails,(err,tokenDetails)=>
                {
                    if(err)
                    {
                        logger.captureError('Failed to generate jwt token','UserController:loginFunction():generateToken()',5);
                        let apiresponse=response.generate(true,'Failed to generate jwt token',500,null);
                        reject(apiresponse);
                    }
                    else
                    {
                        tokenDetails.userId=retrievedUserDetails.userId;
                        tokenDetails.userDetails=retrievedUserDetails;
                        resolve(tokenDetails);
                    }
                })
            }
        )//end new promise
    }//end generate token

    //save token
    let saveToken=(tokenDetailsToSave)=>
    {
        return new Promise(
            (resolve,reject)=>
            {
                authModel.findOne({userId:tokenDetailsToSave.userId})
                .exec(
                    (err,tokenDataFromDB)=>
                    {
                        if(err)
                        {
                            logger.captureError('Failed to save jwt token','UserController:loginFunction():saveToken()',5);
                            let apiresponse=response.generate(true,'Failed to save jwt token',500,null);
                            reject(apiresponse);
                        }
                        else if(checkLib.isEmpty(tokenDataFromDB))
                        {
                            let newToken=new authModel(
                                {
                                    userId:tokenDetailsToSave.userId,
                                    authToken:tokenDetailsToSave.token,
                                    secretKey:tokenDetailsToSave.secretKey,
                                    createdOn:timeLib.now()
                                });

                                newToken.save(
                                    (err,success)=>
                                    {
                                        if(err)
                                        {
                                            logger.captureError('Failed to save jwt token','UserController:loginFunction():saveToken()',5);
                                            let apiresponse=response.generate(true,'Failed to save jwt token',500,null);
                                            reject(apiresponse);
                                        }
                                        else
                                        {
                                            let response=
                                            {
                                                authToken:success.authToken,
                                                userDetails:tokenDetailsToSave.userDetails
                                            }
                                            resolve(response);
                                        }
                                    }
                                )
                        }//end new token
                        else //update token
                        {
                            tokenDataFromDB.userId=tokenDetailsToSave.userId,
                            tokenDataFromDB.authToken=tokenDetailsToSave.token,
                            tokenDataFromDB.secretKey=tokenDetailsToSave.secretKey,
                            tokenDataFromDB.modifiedOn=timeLib.now();
                            tokenDataFromDB.save(
                                (err,success)=>
                                {
                                    if(err)
                                    {
                                        
                                        logger.captureError('Failed to update jwt token','UserController:loginFunction():saveToken()',5);
                                        let apiresponse=response.generate(true,'Failed to update jwt token',500,null);
                                        reject(apiresponse);
                                    }
                                    else
                                    {
                                        let response=
                                        {
                                            authToken:success.authToken,
                                            userDetails:tokenDetailsToSave.userDetails
                                        }
                                        resolve(response);
                                    }

                                }
                            )
                        }
                    }
                );//end authmodel

            }
        )
    }//end save token


    //merge all promises
    validateUserInput(req,res)
    .then(findUser)
    .then(validatePassword)
    .then(generateToken)
    .then(saveToken)
    .then(
        (success)=>
        {
            let apiresponse=response.generate(false,'Login Successfully',200,success);
            res.send(apiresponse);
        }
    )
    .catch(
        (err)=>
        {
            res.send(err);
        }
    )

}//end login function


/**
 * logout function 
 * @param {String} userId
 */
let logoutFunction=(req,res)=>
{

    authModel.findOneAndRemove({userId:req.body.userId})
    .exec(
        (err,result)=>
        {
            if(err)
            {
                logger.captureError('Failed to logout','UserController:logoutFunction()',5);
                let apiresponse=response.generate(true,'Failed to logout + '+err.message,500,null);
                res.send(apiresponse);
            }
            else if(checkLib.isEmpty(result))
            {
                logger.captureError('User not found','UserController:logoutFunction()',5);
                let apiresponse=response.generate(true,'Invalid user or already logged out',404,null);
                res.send(apiresponse);
            }
            else
            {  
                logger.captureInfo('User logout successfully','UserController:logoutFunction()',5);
                let apiresponse=response.generate(false,'Logged out successfully',200,null);
                res.send(apiresponse);

            }
        }
    )

}//end logout function

/**
 * get single user details using userid
 * @param {String} userID 
 */
let getSingleUserDetails=(req,res)=>
{

    userModel.findOne({userId:req.params.userId})
    .select('-password -_id -__v')
    .lean()
    .exec(
        (err,userDetails)=>
        {
            if(err)
            {
                logger.captureError('Error while getting user details of userId -'+ req.params.userId,
                                    'userController:getSingleUserDetails()',5);
                let apiresponse=response.generate(true,'Failed to find user details',500,null);
                res.send(apiresponse);
            }
            else if(checkLib.isEmpty(userDetails))
            {
                logger.captureError('Given user details is not found -'+ req.params.userId,
                                    'userController:getSingleUserDetails()',5);
                let apiresponse=response.generate(true,'User not found',404,null);
                res.send(apiresponse);
            }
            else
            {
                logger.captureInfo('User Found - '+ req.params.userId,
                                    'userController:getSingleUserDetails()',5);

                let apiresponse=response.generate(false,'User details found successfully',200,userDetails);
                res.send(apiresponse);
            }
        }
    );

}//end getSingleUserDetails function
/**
 * Get all the user whose email is verified 
 */
let getAllUserDetails=(req,res)=>
{

    userModel.find({ 'emailVerified': 'yes','isAdmin':'false' })
    .select('-password -__v -_id')
    .lean()
    .exec(
        (err,allUserData)=>
        {
            if(err)
            {
                logger.captureError('Failed to get all user details','userController:getAllUserDetails()',5);
                let apiresponse=response.generate(true,'Failed to get all user details',500,null);
                res.send(apiresponse);
            }
            else if(checkLib.isEmpty(allUserData))
            {
                logger.captureError('No user found','userController:getAllUserDetails()',5);
                let apiresponse=response.generate(true,'No user found',404,null);
                res.send(apiresponse);
            }
            else
            {
                logger.captureInfo('All user details','userController:getAllUserDetails()',5);
                let apiresponse=response.generate(false,'All user details found',200,allUserData);
                res.send(apiresponse);
            }
        }
    )

}//end getAllUserDetails

/**
 * delete user by userid
 * @param {String} userId 
 */
let deleteUser=(req,res)=>
{
    userModel.findOneAndRemove({userId:req.params.userId})
    .exec(
        (err,success)=>
        {
            if(err)
            {
                logger.captureError('Error while getting user details of userId -'+ req.params.userId,
                                     'userController: deleteUser()',5);
                let apiresponse=response.generate(true,'Failed to find user details',500,null);
                res.send(apiresponse);
            }
            else if(checkLib.isEmpty(success))
            {
                logger.captureError('Given user details is not found -'+ req.params.userId,
                                    'userController:deleteUser()',5);
                let apiresponse=response.generate(true,'User not found',404,null);
                res.send(apiresponse);
            }
            else
            {
                logger.captureInfo('User deleted successfully - '+ req.params.userId,
                                   'userController:deleteUser()',5);
                let apiresponse=response.generate(false,'User deleted successfully ',200,success);
                res.send(apiresponse);
            }
        }
    )
}//end deleteUser

/**
 * Edit user details using put method 
 * @param {String} userID
 */
let editUser=(req,res)=>
{
    let options=req.body;
    options.modifiedOn=timeLib.now();
    userModel.updateOne({userId:req.params.userId},options,{multi:true})
    .exec(
        (err,editedData)=>
        {
            if(err)
            {
                logger.captureError('Error while editing user details of userId -'+ req.params.userId,
                                     'userController: editUser()',5);
                let apiresponse=response.generate(true,'Failed to Edit user details',500,null);
                res.send(apiresponse);
            }
            else if(checkLib.isEmpty(editedData))
            {
                logger.captureError('Given user details is not found -'+ req.params.userId,
                                    'userController:editUser()',5);
                let apiresponse=response.generate(true,'User is not found',404,null);
                res.send(apiresponse);
            }
            else
            {
                logger.captureInfo('User updated successfully - '+ req.params.userId,
                                   'userController:editUser()',5);
                let apiresponse=response.generate(false,'User updated successfully ',200,editedData);
                res.send(apiresponse);
            }
        }
    )
}//end edituser

/**
 * Verify email 
 * @param {String} userId 
 */
let verifyEmailFunction=(req,res)=>
{
    let findUser=()=>
    {
        
        return new Promise((resolve,reject)=>
        {
            if(req.body.userId)
            {
                userModel.findOne({userId:req.body.userId})
                .select('-password -_id -__v')
                .lean()
                .exec(
                    (err,userDetails)=>
                    {
                        if(err)
                        {
                            logger.captureError('Error while find user details - '+req.body.userId,'userController:verifyEmailFunction()',5);
                            let apiresponse=response.generate(true,'Failed to find user details',500,null);
                            reject(apiresponse);
                        }
                        else if(checkLib.isEmpty(userDetails))
                        {
                            logger.captureError('User is not found - '+req.body.userId,'userController:verifyEmailFunction()',5);
                            let apiresponse=response.generate(true,'No user found',404,null);
                            reject(apiresponse);
                        }
                        else
                        {
                            resolve(userDetails);
                        }
                    }
                )
            }
            else
            {
                logger.captureError('UserId parameter is missing -'+req.body.userId,'userController:verifyEmailFunction()',5);
                let apiresponse=response.generate(true,'userId parameter is missing',404,null);
                reject(apiresponse);
            }
        });//end new promise
    }//end find user


    let verifyEmail=(userDetails)=>
    {
        return new Promise(
            (resolve,reject)=>
            {
                if(userDetails.emailVerified != 'yes')
                {
                userModel.updateOne({userId:userDetails.userId},{emailVerified:'yes'})
                .exec(
                    (err,result)=>
                    {
                        if(err)
                        {
                            logger.captureError('Error while verify email - '+userDetails.userId,'userController:verifyEmailFunction()',5);
                            let apiresponse=response.generate(true,'Failed to verify email',500,null);
                            reject(apiresponse);
                        }
                        else 
                        {
                                resolve(result);
                                
                            let sendMailDetails=
                            {
                                email:userDetails.email,
                                subject:"Account Verified - Meeting planner",
                                html:` <b>Dear ${userDetails.userName},</b>
                                <br>
                                <br>
                                <i>Welcome to our meeting planner app </i>
                                <br>
                                Your account has been verified
                                <br>`

                            }

                            setTimeout(()=>
                            {
                                emailLib.sendEmail(sendMailDetails);
                            },2000);


                        }
                    }
                )
                }
                else
                {
                    logger.captureError('Already mail is verified - '+userDetails.userId,'userController:verifyEmailFunction()',5);
                    let apiresponse=response.generate(true,'Mail has been verified already',400,null);
                    reject(apiresponse);
                }
            }
        )
    }//end verify email


    findUser(req,res)
    .then(verifyEmail)
    .then(
        (success)=>
        {
            console.log('susu');
            logger.captureInfo('Email Verified successfully for user ',
                                'userController:verifyEmailFunction()',5);
            let apiresponse=response.generate(false,'Email Verified successfully',200,success);
            res.status(200).send(apiresponse);

        }
    )
    .catch(
        (err)=>
        {
            console.log(err);
            res.send(err);
        }
    )

}//end verify email function 

/**
 * Forgot password 
 * @param {String} mail 
 */
let forgotPasswordFunction=(req,res)=>
{
    let findUser=(req,res)=>
    {
        return new Promise(
            (resolve,reject)=>
            {
                if(req.body.email)
                {
                    if(!paramsValidationLib.Email(req.body.email))
                    {
                        logger.captureError('Email does not met the requirement','userController:forgotPasswordFunction()',5);
                        let apiresponse=response.generate(true,'Email does not met the requirement',400,null);
                        reject(apiresponse);
                    }
                    else
                    {
                        userModel.findOne({email:req.body.email})
                        .lean()
                        .exec(
                            (err,userData)=>
                            {
                                if(err)
                                {
                                    logger.captureError('Failed to find user details','userController:forgotPasswordFunction()',5);
                                    let apiresponse=response.generate(true,'Failed to find user details',500,null);
                                    reject(apiresponse);
                                }
                                else if(checkLib.isEmpty(userData))
                                {
                                    logger.captureError('User is not found','userController:forgotPasswordFunction()',5);
                                    let apiresponse=response.generate(true,'User is not found',404,null);
                                    reject(apiresponse);
                                }
                                else
                                {
                                    logger.captureInfo('User is found','userController:forgotPasswordFunction()',5);
                                    resolve(userData);
                                }
                            }
                        )
                    }                  

                }
                else
                {
                    logger.captureError('one or more parameters is missing','userController:forgotPasswordFunction()',5);
                    let apiresponse=response.generate(true,'One or more parameter(s) is missing',404,null);
                    reject(apiresponse);
                }
            }
        )
    }//end find user

    //generate token

    let generateToken=(retrievedUserDetails)=>
    {
        return new Promise(
            (resolve,reject)=>
            {
                
                tokenLib.generateToken(retrievedUserDetails,(err,result)=>
                {
                    if(err)
                    {
                        logger.captureError('Failed to generate token','userController:forgotPasswordFunction()',5);
                        let apiresponse=response.generate(true,'Failed to generate token',500,null);
                        reject(apiresponse);
                    }
                    else
                    {
                        result.userId=retrievedUserDetails.userId;
                        result.userDetails=retrievedUserDetails;
                        resolve(result);
                    }
                });

            }
        )

    }//end generate token

    //resetPasswordDetailsToMail
    let resetPasswordDetailsToMail=(retrievedUserDetailsWithToken)=>
    {
        return new Promise(
            (resolve,reject)=>
            {
                let updateDetails=
                {
                    validationToken:retrievedUserDetailsWithToken.token
                }
                userModel.updateOne({email:req.body.email},updateDetails)
                .exec(
                    (err,result)=>
                    {
                        if(err)
                        {
                            logger.captureError('Failed to update token','userController:forgotPasswordFunction()',5);
                            let apiresponse=response.generate(true,'Failed to reset password',500,null);
                            reject(apiresponse);
                        }
                        else
                        {
                            resolve(result);

                            let sendMailDetails=
                            {
                                email:req.body.email,
                                subject:"Reset password link for meeting planner",
                                html:` <b>Dear ${retrievedUserDetailsWithToken.userDetails.userName},</b>
                                <br>
                                <br>
                                <i><b>Welcome to our meeting planner app <b></i>
                                <br>
                                <br>
                                Please change password using below link
                                <br>
                                <br>
                                <a href="${appUrl}/resetPassword?authToken=${retrievedUserDetailsWithToken.token}">
                                Click Here
                                </a>`

                            }

                            setTimeout(()=>
                            {
                                emailLib.sendEmail(sendMailDetails);
                            },2000);

                        }
                    }
                )
            }
        )
    }//end resetPasswordDetailsToMail

    findUser(req,res)
    .then(generateToken)
    .then(resetPasswordDetailsToMail)
    .then(
        (success)=>
        {
            let apiresponse=response.generate(false,'Reset password details sent to your mail',200,'None');
            res.send(apiresponse);

        }
    )
    .catch(
        (err)=>
        {
            res.status(err.status).send(err);
        }
    )

}//end forgot password


/**
 * Update password
 * @param {String} validationToken 
 * @param {String} password 
 */
let updatePasswordFunction=(req,res)=>
{

    let findUser=()=>
    {
        return new Promise((resolve,reject)=>
        {
            if(req.body.validationToken)
            {
                userModel.findOne({validationToken:req.body.validationToken})
                .select('-password -__v -_id')
                .lean()
                .exec(
                    (err,retrievedUserDetails)=>
                    {
                        if(err)
                        {
                        logger.captureError('Failed to find user','userController:updatePasswordFunction()',5);
                        let apiresponse=response.generate(true,'Failed to find user',500,null);
                        reject(apiresponse);
                        }
                        else if(checkLib.isEmpty(retrievedUserDetails))
                        {
                            logger.captureError('User not found','userController:updatePasswordFunction()',5);
                            let apiresponse=response.generate(true,'User not found',404,null);
                            reject(apiresponse);
                        }
                        else
                        {
                            logger.captureInfo('User Found','userController:updatePasswordFunction()',5);
                            resolve(retrievedUserDetails);
                        }

                    }
                )
            }
            else
            {
                logger.captureError('validationToken is missing','userController:updatePasswordFunction()',5);
                let apiresponse=response.generate(true,'validationToken is missing',404,null);
                reject(apiresponse);
            }
        });
    }//end find user

    let updatePassword=(retrievedUserDetails)=>
    {
        return new Promise((resolve,reject)=>
        {
            let options=
            {
                password:generatePasswordLib.hashPassword(req.body.password),
                validationToken:''
            }

            userModel.updateOne({userId:retrievedUserDetails.userId},options)
            .exec((err,result)=>
            {
                    if(err)
                    {
                        logger.captureError('Failed to update password','userController:updatePasswordFunction()',5);
                        let apiresponse=response.generate(true,'Failed to update password',500,null);
                        reject(apiresponse);
                    }
                    else
                    {
                        resolve(result);
                        let sendMailDetails=
                        {
                            email:retrievedUserDetails.email,
                            subject:"Password update for meeting planner",
                            html:` <b>Dear ${retrievedUserDetails.userName},</b>
                            <br>
                            <br>
                            <i>Welcome to our meeting planner app </i>
                            <br>
                            Password updated successfully`
                        }

                        setTimeout(()=>
                        {
                            emailLib.sendEmail(sendMailDetails);
                        },2000);
                    }
            });

        });
    }//end update password 

    findUser(req,res)
    .then(updatePassword)
    .then(
        (success)=>
        {
            
            let apiresponse=response.generate(false,'Password updated successfully',200,'None');
            res.status(200).send(apiresponse);
        }
    )
    .catch(
        (err)=>
        {
            res.status(err.status).send(err);
        }
    )

}//end update password function

/**
 * change password
 * @param {String} userId 
 * @param {String} oldPassword 
 * @param {String} newPassword 
 */
let changePasswordFunction=(req,res)=>
{
    let findUser=(req,res)=>
    {
        return new Promise((resolve,reject)=>
        {
            if(req.body.userId  && req.body.oldPassword)
            {
                userModel.findOne({userId:req.body.userId})
                .exec((err,resultData)=>
                {
                    if(err)
                    {
            
                        logger.captureError('Failed to  change password','UserController:changePasswordFunction()',5);
                        let apiresponse=response.generate(true,'Failed to  change password',500,null);
                        reject(apiresponse);
                    }
                    else if(checkLib.isEmpty(resultData))
                    {
                        logger.captureError('User not found','UserController:changePasswordFunction()',5);
                        let apiresponse=response.generate(true,'User not found',404,null);
                        reject(apiresponse);
                    }
                    else
                    {
                        
                        resolve(resultData);
                    }

                });

            }
        
            else
            {
            
                logger.captureError('Field missing while change password','UserController:changePasswordFunction()',5);
                let apiresponse=response.generate(true,'one or more parameter(s) is missing',404,null);
                reject(apiresponse);

            }

        });
    }//end find user

    let validatePassword=(retrievedUserDetails)=>
    {
        return new Promise((resolve,reject)=>
        {
            
            generatePasswordLib.comparePassword(req.body.oldPassword,retrievedUserDetails.password,
            (err,isMatched)=>{
                if(err)
                {
                    logger.captureError('Failed to validate password','UserController:changePasswordFunction()',5);
                    let apiresponse=response.generate(true,'Failed to change password',500,null);
                    reject(apiresponse);
                }
                else if(isMatched)
                {
                    let newObj=retrievedUserDetails.toObject();
                    delete newObj.password;
                    delete newObj.__v;
                    delete newObj.createdOn;
                    delete newObj._id;
                    delete newObj.modifiedOn;
                    resolve(newObj);

                }
                else
                {
                    logger.captureError('Failed due to wrong password from user','UserController:changePasswordFunction()',5);
                    let apiresponse=response.generate(true,'Invalid current password',400,null);
                    reject(apiresponse);

                }
            });
        });
    }//validate password

    let changePasswordUpdate=(retrievedUserDetails)=>
    {
        return new Promise(
            (resolve,reject)=>
        {
            if(!paramsValidationLib.Password(req.body.newPassword))
            {
                logger.captureError('Password not met the requirement','UserController:changePasswordFunction()',5);
                let apiresponse=response.generate(true,'Password not met the requirement',400,null);
                reject(apiresponse);

            }
            else
            {

           
                let passwordDetails=
                {
                    password:generatePasswordLib.hashPassword(req.body.newPassword)
                }
    
                userModel.updateOne({userId:retrievedUserDetails.userId},passwordDetails)
                .exec(
                    (err,success)=>
                    {
                        if(err)
                        {
                            logger.captureError('Failed to change password in database','UserController:changePasswordFunction()',5);
                            let apiresponse=response.generate(true,'Failed to change password',500,null);
                            reject(apiresponse);
                        }
                        else 
                        {
                            resolve(success);
    
                            let sendMailDetails=
                            {
                                email:retrievedUserDetails.email,
                                subject:"Password update for meeting planner",
                                html:` <b>Dear ${retrievedUserDetails.userName},</b>
                                <br>
                                <br>
                                <i>Welcome to our meeting planner app </i>
                                <br>
                                Password updated successfully`
                            }
    
                            setTimeout(()=>
                            {
                                emailLib.sendEmail(sendMailDetails);
                            },2000);
    
                        }
                    }
                )

    
          
            }
          

        });
    }//end change password update

    findUser(req,res)
    .then(validatePassword)
    .then(changePasswordUpdate)
    .then(
        (success)=>
        {
            logger.captureError('Password changed successfully for user'+req.body.userId,'UserController:changePasswordFunction()',5);
            let apiresponse=response.generate(false,'Password changed successfully',200,'None')
            res.status(200).send(apiresponse);
        }
    )
    .catch(
        (err)=>
        {
            res.status(err.status).send(err);
        }
    )
}//end change password function


module.exports=
{
    signUpFunction:signUpFunction,
    loginFunction:loginFunction,
    getSingleUserDetails:getSingleUserDetails,
    deleteUser:deleteUser,
    editUser:editUser,
    verifyEmailFunction:verifyEmailFunction,
    logoutFunction:logoutFunction,
    getAllUserDetails:getAllUserDetails,
    forgotPasswordFunction:forgotPasswordFunction,
    changePasswordFunction:changePasswordFunction,
    updatePasswordFunction:updatePasswordFunction
}