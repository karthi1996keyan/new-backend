const express=require('express');
const appConfig=require('../../config/appConfig');
const userController=require('../controllers/userController');

const authMiddleware=require('../middlewares/auth');
let setRoute=(app)=>
{
    let apiUrl=`${appConfig.apiVersion}/users`;

    /**
     * @apiGroup users
     * @apiVersion  1.0.0
     * @api {post} /api/v1.0.0/users/signup api for Registering User.
     *
     * @apiParam {string} firstName First Name of the user. (body params) (required)
     * @apiParam {string} lastname Last Name of the user. (body params) (required)
     * @apiParam {string} userName userName of the user. (body params) (required)
     * @apiParam {string} countryName country Name of the user. (body params) (required)
     * @apiParam {string} mobileNumber Mobile Number of the user. (body params) (required)
     * @apiParam {string} isAdmin String(true/false) true-if user is admin and false-if user is not admin. (body params) (required)
     * @apiParam {string} email email of the user. (body params) (required)
     * @apiParam {string} password password of the user. (body params) (required)
     *
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
        {
        "error": false,
        "message": "User Created",
        "status": 200,
        "data": [
            {
                "createdOn": "2018-09-12T13:42:58.000Z",
                "emailVerified": "NO",
                "validationToken": "Null",
                "email": "karhirajakarthik.k@gmail.com",
                "password": "$2a$10$XvHxf9JX76JvvIeqwd2CoOdxtCraX23nR2ToAYIhynLmNquDFdbOa",
                "isAdmin": "true,
				"status":offine,
                "mobileNumber": "9788364345",
                "countryName": "IN",
                "userName": "Shah-admin",
                "lastName": "k",
                "firstName": "karthikeyan",
                "userId": "B1cyuc8OX"
            }
        }
    */




    app.post(`${apiUrl}/signup`,userController.signUpFunction);

	    /**
     * @apiGroup users
     * @apiVersion  1.0.0
     * @api {post} /api/v1.0.0/users/login api for Login user.
     *
     * @apiParam {string} email email of the user. (body params) (required)
     * @apiParam {string} password password of the user. (body params) (required)
     *
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
        {
			"error": false,
            "message": "Login Successful",
            "status": 200,
            "data": {
					"authToken": "jaNNknlkMLMLmkN,mlMTc1NzU1NywiZXhwIjoxNTM3MTc4MTU3LCJzdWIiOiJhdXRoVG9rZW4iLCJpc3MiOiJsZXRzTWVldEFwcCIsImRhdGEiOnsiZW1haWxWZXJpZmllZCI6IlllcyIsInZhbGlkYXRpb25Ub2tlbiI6Ik51bGwiLCJlbWFpbCI6InNheXllZHNvZnR0ZWNoMzEzQGdtYWlsLmNvbSIsImlzQWRtaW4iOiJ0cnVlIiwibW9iaWxlTnVtYmVyIjoiOTEgNzg0MDk2Mjg4NyIsImNvdW50cnlOYW1lIjoiSW5kaWEiLCJ1c2VyTmFtZSI6IlNoYWgtYWRtaW4iLCJsYXN0TmFtZSI6IlNheXllZCIsImZpcnN0TmFtZSI6IlNoYWhydWtoIiwidXNlcklkIjoiQjFjeXVjOE9YIn19.fcCu0TZQ-WnAs8bOmZa9YhF1YVv2JscTwOPT--rTwbc",
					"userDetails": {
                    "emailVerified": "Yes",
                    "validationToken": "Null",
                    "email": "karthirajakarthik.k@gmail.com",
                    "isAdmin": "true",
                    "mobileNumber": "978864345",
                    "countryName": "IN",
                    "userName": "karthikeyan-admin",
                    "lastName": "k",
                    "firstName": "karthikeyan",
                    "userId": "B1cyuc8OX"
                }
            }
        }
    */
	
	
    app.post(`${apiUrl}/login`,userController.loginFunction);

	/**
     * @apiGroup users
     * @apiVersion  1.0.0
     * @api {get} /api/v1.0.0/users/view/details/:userId api for Getting single user details.
     *
     * @apiParam {string} authToken authToken of the user. (query/body/header params) (required)
     * 
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
        {
            "error": false,
            "message": "All User Details Found",
            "status": 200,
            "data": [
                {
					
                "createdOn": "2018-09-12T13:42:58.000Z",
                "emailVerified": "NO",
                "validationToken": "Null",
                "email": "karhirajakarthik.k@gmail.com",
                "password": "$2a$10$XvHxf9JX76JvvIeqwd2CoOdxtCraX23nR2ToAYIhynLmNquDFdbOa",
                "isAdmin": "true,
				"status":offine,
                "mobileNumber": "9788364345",
                "countryName": "IN",
                "userName": "Shah-admin",
                "lastName": "k",
                "firstName": "karthikeyan",
                "userId": "B1cyuc8OX"
                  
                }
            ]
        }
    */

	
    app.get(`${apiUrl}/view/details/:userId`,authMiddleware.isAuthorized,userController.getSingleUserDetails);

    app.post(`${apiUrl}/delete/:userId`,authMiddleware.isAuthorized,userController.deleteUser);
 /**
     * @apiGroup users
     * @apiVersion  1.0.0
     * @api {post} /api/v1.0.0/delete/:userId api for delete User.
      *
	   * @apiParam {string} userId userId of the user. (query params) (required)
     * @apiParam {string} authToken authToken of the user. (query/body/header params) (required)

     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * * 
     * @apiSuccessExample {object} Success-Response:
        {
        "error": false,
        "message": "User deleted successfully",
        "status": 200,
        "data": [
            {
                "createdOn": "2018-09-12T13:42:58.000Z",
                "emailVerified": "NO",
                "validationToken": "Null",
                "email": "karhirajakarthik.k@gmail.com",
                "password": "$2a$10$XvHxf9JX76JvvIeqwd2CoOdxtCraX23nR2ToAYIhynLmNquDFdbOa",
                "isAdmin": "true",
				"status":"offine",
                "mobileNumber": "9788364345",
                "countryName": "IN",
                "userName": "Shah-admin",
                "lastName": "k",
                "firstName": "karthikeyan",
                "userId": "B1cyuc8OX"
            }
        }
    */

	
    app.put(`${apiUrl}/verifyEmail`,userController.verifyEmailFunction);
    /**
       * @apiGroup users
       * @apiVersion  1.0.0
       * @api {put} /api/v1.0.0/users/verifyEmail api for Verifying User Email Id.
       *
       * @apiParam {string} userId userId of the user. (body params) (required)
       *
       * @apiSuccess {object} myResponse shows error status, message, http status code, result.
       * 
       * @apiSuccessExample {object} Success-Response:
          {
              "error": false,
              "message": "Email Verified successfully",
              "status": 200,
              "data": "None"
          }
      */
  
    app.get(`${apiUrl}/view/all`,authMiddleware.isAuthorized,userController.getAllUserDetails);
	
	/**
     * @apiGroup users
     * @apiVersion  1.0.0
     * @api {get} /api/v1.0.0/users/view/all api for Getting all users.
     *
     * @apiParam {string} authToken authToken of the user. (query/body/header params) (required)
     * 
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
        {
            "error": false,
            "message": "All User Details Found",
            "status": 200,
            "data": [
                {
					
                "createdOn": "2018-09-12T13:42:58.000Z",
                "emailVerified": "NO",
                "validationToken": "Null",
                "email": "karhirajakarthik.k@gmail.com",
                "password": "$2a$10$XvHxf9JX76JvvIeqwd2CoOdxtCraX23nR2ToAYIhynLmNquDFdbOa",
                "isAdmin": "true,
				"status":offine,
                "mobileNumber": "9788364345",
                "countryName": "IN",
                "userName": "Shah-admin",
                "lastName": "k",
                "firstName": "karthikeyan",
                "userId": "B1cyuc8OX"
                  
                }
            ]
        }
    */

	

	/**
     * @apiGroup users
     * @apiVersion  1.0.0
     * @api {post} /api/v1.0.0/users/forgot-password api for Password Reset.
     *
     * @apiParam {string} email email of the user. (body params) (required)
     *
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
        {
            "error": false,
            "message": "Reset password details sent to your mail",
            "status": 200,
            "data": None
        }    
    */

	
	
    app.post(`${apiUrl}/forgot-password`,userController.forgotPasswordFunction);
	
	 /**
     * @apiGroup users
     * @apiVersion  1.0.0
     * @api {put} /api/v1.0.0/users/update-password api for Updating Password 
     *
     * @apiParam {string} validationToken validationToken of the user recieved on Email. (body params) (required)
     * @apiParam {string} password new password of the user . (body params) (required)
     *
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
        {
            "error": false,
            "message": "Password updated successfully",
            "status": 200,
            "data": "None"
            
        }
    */

    // params: userId, oldPassword,newPassword.
   

    app.put(`${apiUrl}/update-password`,userController.updatePasswordFunction);
	/**
     * @apiGroup users
     * @apiVersion  1.0.0
     * @api {post} /api/v1.0.0/users/change-password api for Changing Password.
     *
     * @apiParam {string} userId userId of the user. (body params) (required)
     * @apiParam {string} oldPassword old Password of the user. (body params) (required)
     * @apiParam {string} newPassword new Password of the user. (body params) (required)
     *
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
        {
            "error": false,
            "message": "Password changed successfully",
            "status": 200,
            "data": "None"
        }
    */


	
	app.post(`${apiUrl}/change-password`,authMiddleware.isAuthorized,userController.changePasswordFunction);

	
    app.post(`${apiUrl}/logout`,userController.logoutFunction);
	
	 /**
     * @apiGroup users
     * @apiVersion  1.0.0
     * @api {post} /api/v1.0.0/users/logout api to logout from application.
     *
     * @apiParam {string} userId userId of the user. (body params) (required)
     * @apiParam {string} authToken authToken of the user. (query/body/header params) (required)

     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
        {
            "error": false,
            "message": "Logged Out Successfully",
            "status": 200,
            "data": null
        }
    */

	
}

module.exports=
{
    setRoute:setRoute
}