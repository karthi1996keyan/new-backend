const mongoose=require('mongoose');
const shortId=require('shortid');
//libs
const logger=require('../libs/loggerLib');
const tokenLib=require('../libs/tokenLib');
const paramsValidationLib=require('../libs/paramValidationLib');
const checkLib=require('../libs/checkLib');
const timeLib=require('../libs/timeLib')
const generatePasswordLib=require('../libs/generatePasswordLib');
const emailLib=require('../libs/emailLib');
const response=require('../libs/responseLib');
const todayMeetingLib=require('../libs/todayMeetingOnlyLib');

//models
const meetingModel=mongoose.model('meetingModel');
const userModel=mongoose.model('userModel');


/**
 * add new meeting function
 * @param {String} meetingTitle 
 * @param {String} hostId 
 * @param {String} hostName 
 * @param {String} participantId 
 * @param {String} participantName 
 * @param {String} participantEmail 
 * @param {String} meetingStartDate 
 * @param {String} meetingEndDate 
 * @param {String} meetingDescription 
 * @param {String} meetingPlace 
 */
let addNewMeetingFunction=(req,res)=>
{

    //validate user input 
    let validateUserInput=()=>
    {
        return new Promise(
            (resolve,reject)=>
            {
                if(req.body.meetingTitle && req.body.hostId && req.body.hostName
                    && req.body.participantId && req.body.participantName &&
                    req.body.participantEmail && req.body.meetingDescription && 
                    req.body.meetingPlace && req.body.meetingStartDate && req.body.meetingEndDate)
                    {
                        resolve(req);
                    }                
                    else
                    {
                     logger.captureError('One or more parameter(s) is missing during meeting creation','meetingController:validateUserInput()',5);
                     let apiresponse=response.generate(true,'One or more parameter(s) is missing',404,null);
                     reject(apiresponse);
                    }

            }
        )
    }//end validate user input

    let addMeeting=()=>
    {
        return new  Promise(
            (resolve,reject)=>
            {
                let newMeeting=new meetingModel(
                    {
                        meetingId:shortId.generate(),
                        hostId:req.body.hostId,
                        hostName:req.body.hostName,
                        participantEmail:req.body.participantEmail,
                        participantId:req.body.participantId,
                        participantName:req.body.participantName,
                        meetingDescription:req.body.meetingDescription,
                        meetingPlace:req.body.meetingPlace,
                        meetingTitle:req.body.meetingTitle,
                        meetingStartDate:req.body.meetingStartDate,
                        meetingEndDate:req.body.meetingEndDate,
                        createdOn:timeLib.now()
                    });

                    
                    newMeeting.save(
                        (err,success)=>
                        {
                            if(err)
                            {
                                logger.captureError(err.message+'Failed to save meeting details','meetingController:validateUserInput()',5);
                                let apiresponse=response.generate(true,'Failed to schedule meeting ',500,null);
                                reject(apiresponse);
                            }
                            else
                            {
                                let meetingObj=success.toObject();

                                
                                 let startDate=new Date(meetingObj.meetingStartDate);
                                 startDate.setHours(startDate.getHours() - 5);
                                startDate.setMinutes(startDate.getMinutes()-30);
                                let endDate=new Date(meetingObj.meetingEndDate);
                                endDate.setHours(endDate.getHours()-5);
                                endDate.setMinutes(endDate.getMinutes()-30);

                                let sendMailDetails=
                                {
                                    
                                    email:meetingObj.participantEmail,
                                    subject:"New meeting has been scheduled",
                                    html:`

                                    <h1>Dear ${meetingObj.participantName},</h1>
                                    <p style="font-size:1.5rem;color:white;background-color:darkviolet;padding:4px;text-align:center">Welocme to meeting planner app

                                    <p style="font-size:2rem"><b >${meetingObj.hostName}</b> scheduled <b style="color:green"> new meeting </b> for you</p>
                                    <div style="margin:10px;margin:2%">
                                        <div style="border:5px solid purple;color:blue;text-align:center">
                                            <h3 style="margin:0px;background-color:purple;padding:30px;font-size:1.9rem;color:white">${meetingObj.meetingTitle}</h3>
                                            <div style="margin:0px;">
                                            <p style="text-align:center;color:blue;font-size:1.7rem;">
                                                <b style="background:indigo;color:white;padding:5px;border-radius:10px;">Meeting start Date</b> 
                                                <br><br>${startDate}
                                            </p>
                                            <p style="text-align:center;color:blue;font-size:1.7rem;">
                                                <b style="background:indigo;color:white;padding:5px;border-radius:10px;">Meeting End Date</b> 
                                                <br><br>${endDate}
                                            </p>
                                            <p style="text-align:center;color:blue;font-size:1.7rem;">
                                                <b style="background:indigo;color:white;padding:5px;border-radius:10px;">Meeting Description</b> 
                                                <br><br>${meetingObj.meetingDescription}
                                            </p>
                                            <p style="text-align:center;color:blue;font-size:1.7rem;">
                                                <b style="background:indigo;color:white;padding:5px;border-radius:10px;">Meeting Place</b> 
                                                <br><br>${meetingObj.meetingPlace}
                                            </p>
                                            </div>
                                        
                                        </div>
                                        
                                    </div>


                               `
                                }

                                resolve(meetingObj);

                                setTimeout(()=>
                                {
                                 emailLib.sendEmail(sendMailDetails);
                                },2000);

                            }
                        }
                    )
            }
        )
    }// end add meeting

    validateUserInput(req,res)
    .then(addMeeting)
    .then(
        (success)=>
        {
            let apiresponse=response.generate(false,'Meeting Scheduled successfully',200,success);
            res.status(200).send(apiresponse);
        }
    )
    .catch(
        (err)=>
        {
            res.status(err.status).send(err);
        }
    )

}//end add new meeting function


/**
 * add new meeting function
 * @param {String} meetingTitle 
 * @param {String} hostId 
 * @param {String} hostName 
 * @param {String} participantId 
 * @param {String} participantName 
 * @param {String} participantEmail 
 * @param {String} meetingStartDate 
 * @param {String} meetingEndDate 
 * @param {String} meetingDescription 
 * @param {String} meetingPlace 
 * @param {String} meetingId 
 */

let updateMeetingFunction=(req,res)=>
{
    let findMeetingDetails=()=>
    {
        return new Promise(
            (resolve,reject)=>
            {
                meetingModel.findOne({meetingId:req.params.meetingId})
                .select('-__v -_id')
                .lean()
                .exec(
                    (err,meetingDetails)=>
                    {
                        if(err)
                        {
                            logger.captureError('Failed to get meeting details','meetingController:updateMeetingFunction()',5);
                            let apiresponse=response.generate(true,'Failed to get meeting details',500,null);
                            reject(apiresponse);
                        }
                        else if(checkLib.isEmpty(meetingDetails))
                        {
                            logger.captureError('Meeting not found','meetingController:updateMeetingFunction()',5);
                            let apiresponse=response.generate(true,'Meeting not found',404,null);
                            reject(apiresponse);
                        }
                        else
                        {
                            resolve(meetingDetails);
                        }
                    }
                )
            }
        )
    }//end find Meeting Details

    let updateMeetingDetails=(retrievedMeetingDetails)=>
    {

        
        return new Promise(
            (resolve,reject)=>
            {
                req.body.modifiedOn=timeLib.now();
                meetingModel.update({meetingId:retrievedMeetingDetails.meetingId},req.body)
                .exec((err,updated)=>
                {
                    if(err)
                    {
                        logger.captureError('Failed to update meeting'+err,'meetingController:updateMeetingFunction()',5);
                        let apiresponse=response.generate(true,'Failed to update meeting',500,null);
                        reject(apiresponse);
                    }
                    else
                    {
                     
                        
                        let meetingObj=retrievedMeetingDetails;

                        
                        let startDate=new Date(meetingObj.meetingStartDate);
                        startDate.setHours(startDate.getHours() - 5);
                       startDate.setMinutes(startDate.getMinutes()-30);
                       let endDate=new Date(meetingObj.meetingEndDate);
                       endDate.setHours(endDate.getHours()-5);
                       endDate.setMinutes(endDate.getMinutes()-30);
                       
                        let sendMailDetails=
                        {
                            email:meetingObj.participantEmail,
                            subject:"Meeting has been updated",
                            html:`

                            <h1>Dear ${meetingObj.participantName},</h1>
                            <p style="font-size:1.5rem;color:white;background-color:darkviolet;padding:4px;text-align:center">Welocme to meeting planner app

                            <p style="font-size:2rem"><b >${meetingObj.hostName}</b> <b style="color:green">Updated</b> your meeting </p>
                            <div style="margin:10px;margin:2%">
                                <div style="border:5px solid purple;color:blue;text-align:center">
                                    <h3 style="margin:0px;background-color:purple;padding:30px;font-size:1.9rem;color:white">${meetingObj.meetingTitle}</h3>
                                    <div style="margin:0px;">
                                    <p style="text-align:center;color:blue;font-size:1.7rem;">
                                        <b style="background:indigo;color:white;padding:5px;border-radius:10px;">Meeting start Date</b> 
                                        <br><br>${startDate}
                                    </p>
                                    <p style="text-align:center;color:blue;font-size:1.7rem;">
                                        <b style="background:indigo;color:white;padding:5px;border-radius:10px;">Meeting End Date</b> 
                                        <br><br>${endDate}
                                    </p>
                                    <p style="text-align:center;color:blue;font-size:1.7rem;">
                                        <b style="background:indigo;color:white;padding:5px;border-radius:10px;">Meeting Description</b> 
                                        <br><br>${meetingObj.meetingDescription}
                                    </p>
                                    <p style="text-align:center;color:blue;font-size:1.7rem;">
                                        <b style="background:indigo;color:white;padding:5px;border-radius:10px;">Meeting Place</b> 
                                        <br><br>${meetingObj.meetingPlace}
                                    </p>
                                    </div>
                                
                                </div>
                                
                            </div>



                            `
                        }

                        resolve(meetingObj);

                        setTimeout(()=>
                        {
                         emailLib.sendEmail(sendMailDetails);
                        },2000);

                    }
                });
            }
        )
    }//end update meeting details


    findMeetingDetails(req,res)
    .then(updateMeetingDetails)
    .then(
        (success)=>
        {
                let apiresponse=response.generate(false,'Meeting has been updated successfully',200,'None');
                res.status(200).send(apiresponse);
        }
    )
    .catch(
    (err)=>
    {
        res.status(err.status).send(err);
    }
    )

}//update meeting funtion
/**
 * delete meeting details
 * @param {String} meetingId 
 */
let deleteMeetingDetailsFuntion=(req,res)=>
{

    
    let findMeetingDetails=()=>
    {
        return new Promise(
            (resolve,reject)=>
            {
                meetingModel.findOne({meetingId:req.params.meetingId})
                .select('-__v -_id')
                .lean()
                .exec(
                    (err,meetingDetails)=>
                    {
                        if(err)
                        {
                            logger.captureError('Failed to get meeting details','meetingController:updateMeetingFunction()',5);
                            let apiresponse=response.generate(true,'Failed to get meeting details',500,null);
                            reject(apiresponse);
                        }
                        else if(checkLib.isEmpty(meetingDetails))
                        {
                            logger.captureError('Meeting not found','meetingController:updateMeetingFunction()',5);
                            let apiresponse=response.generate(true,'Meeting not found',404,null);
                            reject(apiresponse);
                        }
                        else
                        {
                            resolve(meetingDetails);
                        }
                    }
                )
            }
        )
    }//end find Meeting Details

    let deleteMeeting=(retrievedMeetingDetails)=>
    {
        return new Promise(
            (resolve,reject)=>
            {

                meetingModel.findOneAndRemove({meetingId:req.params.meetingId})
                .exec((err,success)=>
                {
                    if(err)
                    {
                        logger.captureError('Failed to delet meeting','meetingController:deleteMeetingFunction()',5);
                        let apiresponse=response.generate(true,'Failed to delete meeting',500,null);
                        reject(apiresponse);
                    }
                    else if(checkLib.isEmpty(success))
                    {
                        logger.captureError('Meeting not found','meetingController:deleteMeetingFunction()',5);
                        let apiresponse=response.generate(true,'Meeting not found',404,null);
                        reject(apiresponse);
                    }
                    else
                    {
                              
                        let meetingObj=retrievedMeetingDetails;


                        
                        let startDate=new Date(meetingObj.meetingStartDate);
                        startDate.setHours(startDate.getHours() - 5);
                       startDate.setMinutes(startDate.getMinutes()-30);
                       let endDate=new Date(meetingObj.meetingEndDate);
                       endDate.setHours(endDate.getHours()-5);
                       endDate.setMinutes(endDate.getMinutes()-30);

            
                        let sendMailDetails=
                        {
                            email:meetingObj.participantEmail,
                            subject:"Meeting has been Deleted",
                            html:`

                            <h1>Dear ${meetingObj.participantName},</h1>
                            <p style="font-size:1.5rem;color:white;background-color:darkviolet;padding:4px;text-align:center">Welocme to meeting planner app

                            <p style="font-size:2rem"><b >${meetingObj.hostName}</b> <b style="color:red"> deleted  </b> your meeting </p>
                            <div style="margin:10px;margin:2%">
                                <div style="border:5px solid purple;color:blue;text-align:center">
                                    <h3 style="margin:0px;background-color:purple;padding:30px;font-size:1.9rem;color:white">${meetingObj.meetingTitle}</h3>
                                    <div style="margin:0px;">
                                    <p style="text-align:center;color:blue;font-size:1.7rem;">
                                        <b style="background:indigo;color:white;padding:5px;border-radius:10px;">Meeting start Date</b> 
                                        <br><br>${startDate}
                                    </p>
                                    <p style="text-align:center;color:blue;font-size:1.7rem;">
                                        <b style="background:indigo;color:white;padding:5px;border-radius:10px;">Meeting End Date</b> 
                                        <br><br>${endDate}
                                    </p>
                                    <p style="text-align:center;color:blue;font-size:1.7rem;">
                                        <b style="background:indigo;color:white;padding:5px;border-radius:10px;">Meeting Description</b> 
                                        <br><br>${meetingObj.meetingDescription}
                                    </p>
                                    <p style="text-align:center;color:blue;font-size:1.7rem;">
                                        <b style="background:indigo;color:white;padding:5px;border-radius:10px;">Meeting Place</b> 
                                        <br><br>${meetingObj.meetingPlace}
                                    </p>
                                    </div>
                                
                                </div>
                                
                            </div>


                            `
                        }
            
                        resolve(meetingObj);
            
                        setTimeout(()=>
                        {
                         emailLib.sendEmail(sendMailDetails);
                        },2000);
            
            
            
                    }
                })

            }
        )
    }//end delete meeting details

   findMeetingDetails(req,res)
   .then(deleteMeeting)
   .then(
    (success)=>
    {
            let apiresponse=response.generate(false,'Meeting has been deleted successfully',200,'None');
            res.status(200).send(apiresponse);
    }
    )
    .catch(
    (err)=>
    {
        res.status(err.status).send(err);
    }
    )
   
}//end meeting delete function

/**
 * get all meeting details 
 * @param {String} userId
 */

 let getAllMeetingDetails=(req,res)=>
 {

      // find user details

      let FindUserDetails=()=>
      {
          return new Promise(
              (resolve,reject)=>
              {
  
                  if(req.params.userId)
                  {
                      
                      userModel.findOne({userId:req.params.userId})
                      .select('-password -__v -_id')
                      .lean()
                      .exec(
                          (err,userDetails)=>
                          {
                              if(err)
                              {
                                  logger.captureError('Failed to find user details','MeetingController:getAllMeetingDetails()',5);
                                  let apiresponse=response.generate(true,'Failed to find user details',500,null);
                                  reject(apiresponse);
                              }
                              else if(checkLib.isEmpty(userDetails))
                              {
                                  logger.captureInfo('User not found','MeetingController:getAllMeetingDetails()',5);
                                  let apiresponse=response.generate(true,'User not found',404,null);
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
                      logger.captureInfo('userId parameter is missing','MeetingController:getAllMeetingDetails()',5);
                      let apiresponse=response.generate(true,'userId parameter is missing',404,null);
                      reject(apiresponse);
                  }
                 
              });
      }//end find user details


      let findMeetingDetails=(retrievedUserDetails)=>
      {
          return new Promise(
              (resolve,reject)=>
              {
                  if(retrievedUserDetails.isAdmin == "true")
                  {
                    meetingModel.find({hostId:req.params.userId})
                    .select('-__v -_id')
                    .lean()
                    .exec(
                        (err,meetingDetails)=>
                        {
                            if(err)
                            {
                                logger.captureError('Failed to find meeting details','MeetingController:getAllMeetingDetails()',5);
                                  let apiresponse=response.generate(true,'Failed to find meeting details',500,null);
                                  reject(apiresponse);
                            }
                            else if(checkLib.isEmpty(meetingDetails))
                            {
                                logger.captureInfo('Meeting not found','MeetingController:getAllMeetingDetails()',5);
                                let apiresponse=response.generate(true,'Meeting not found',404,null);
                                reject(apiresponse);
                            }
                            else 
                            {
                                resolve(meetingDetails);
                            }
                        }
                    )
                  }
                  else
                  {
                    meetingModel.find({participantId:req.params.userId})
                    .select('-__v -_id')
                    .lean()
                    .exec(
                        (err,meetingDetails)=>
                        {
                            if(err)
                            {
                                logger.captureError('Failed to find meeting details','MeetingController:getAllMeetingDetails()',5);
                                  let apiresponse=response.generate(true,'Failed to find meeting details',500,null);
                                  reject(apiresponse);
                            }
                            else if(checkLib.isEmpty(meetingDetails))
                            {
                                logger.captureInfo('Meeting not found','MeetingController:getAllMeetingDetails()',5);
                                let apiresponse=response.generate(true,'Meeting not found',404,null);
                                reject(apiresponse);
                            }
                            else 
                            {
                                resolve(meetingDetails);
                            }
                        }
                    )

                  }
              }
          )

      }//end find meeting details


      FindUserDetails(req,res)
      .then(findMeetingDetails)
      .then(
          (success)=>
          {
              logger.captureInfo('Meeting details found successfully','MeetingController:getAllMeetingDetails()',5)
              let apiresponse=response.generate(false,'Meeting details found successfully',200,success);
              res.status(200).send(apiresponse);
          }
      )
      .catch(
          (err)=>
          {
              res.send(err);
          }
      )
 }//end get allmeeting details

 /**
  * get meeting details 
  * @param {String} meetingId
  */
let getMeetingDetails=(req,res)=>
{
    meetingModel.findOne({meetingId:req.params.meetingId})
    .select('-__v -_id')
    .lean()
    .exec(
        (err,meetingDetails)=>
        {
            if(err)
            {
                logger.captureError('Failed to find meeting details','meetingController:getMeetingDetails()',5);
                let apiresponse=response.generate(true,'Failed to find meeting details',500,null);
                res.send(apiresponse);
            }
            else if(checkLib.isEmpty(meetingDetails))
            {
                logger.captureInfo('No meeting found','meetingController:getMeetingDetails()',5);
                let apiresponse=response.generate(true,'No meeting found',404,null);
                res.send(apiresponse);
            }
            else
            {
                logger.captureInfo('Meeting found successfully','meetingController:getMeetingDetails()',5);
                let apiresponse=response.generate(false,'Meeting found successfully',200,meetingDetails);
                res.send(apiresponse);
            }
        }
    )
}//end getmeetingdetails funtion

/**
 * sendNotificationTodayMeeting
 * @param {String} userId
 */

let sendNotificationTodayMeeting=(req,res)=>
{
    
    // find user details

    let FindUserDetails=()=>
    {
        return new Promise(
            (resolve,reject)=>
            {

                if(req.body.userId)
                {
                    userModel.findOne({userId:req.body.userId})
                    .select('-password -__v -_id')
                    .lean()
                    .exec(
                        (err,userDetails)=>
                        {
                            if(err)
                            {
                                logger.captureError('Failed to find user details','MeetingController:sendNotificationTodayMeeting()',5);
                                let apiresponse=response.generate(true,'Failed to find user details',500,null);
                                reject(apiresponse);
                            }
                            if(userDetails.isAdmin == 'false')
                            {
                                logger.captureError('not admin - not authorized','MeetingController:sendNotificationTodayMeeting()',5);
                                let apiresponse=response.generate(true,'You dont have admin access',400,null);
                                reject(apiresponse);
                            }
                            
                            else if(checkLib.isEmpty(userDetails))
                            {
                                logger.captureInfo('User not found','MeetingController:sendNotificationTodayMeeting()',5);
                                let apiresponse=response.generate(true,'User not found',404,null);
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
                    logger.captureInfo('userId parameter is missing','MeetingController:sendNotificationTodayMeeting()',5);
                    let apiresponse=response.generate(true,'userId parameter is missing',404,null);
                    reject(apiresponse);
                }
               
            });
    }//end find user details

    let findMeetingDetails=(retrievedUserDetails)=>
    {

        

        return new Promise(
            (resolve,reject)=>
            {
                if(retrievedUserDetails.isAdmin == 'true')
                {
                    meetingModel.find({hostId:req.body.userId})
                    .lean()
                    .exec(
                        (err,allMeetingDetails)=>
                        {
                            if(err)
                            {
                                logger.captureError('Failed to find meeting details','meetingController:sendNotificationTodayMeeting()',5);
                                let apiresponse=response.generate(true,'Failed to find meeting details',500,null);
                                reject(apiresponse);
                            }
                            else if(checkLib.isEmpty(allMeetingDetails))
                            {
                                logger.captureError('No meeting found','meetingController:sendNotificationTodayMeeting()',5);
                                let apiresponse=response.generate(true,'No meeting found',404,null);
                                reject(apiresponse);
                            }
                            else
                            {
                                let i=0;
                                for(let meeting of allMeetingDetails)
                                {
                                    if(todayMeetingLib.compareTodayMeetingDate(meeting.meetingStartDate))
                                    {
                                        let sendMailDetails=
                                        {
                                            email:meeting.participantEmail,
                                            subject:`Meeting remainder:${meeting.meetingTitle} from ${meeting.hostName}`,
                                            html:`<b>Dear ${meeting.participantName}</b>
                                            <br>
                                            Gentle remainder for today meeting<br>
                                            Meeting Details:
                                            <br>Place : ${meeting.meetingPlace}`
                                        }

                                        setTimeout(()=>
                                        {
                                            emailLib.sendEmail(sendMailDetails);
                                        },2000);
                                    }
                                }
                                resolve("success");
                            }
                        }
                    )
                }
            }
        )
    }//end find meeting details


    FindUserDetails(req,res)
    .then(findMeetingDetails)
    .then(
        (success)=>
        {
            let apiresponse=response.generate(false,'Meetings found and sent remainders',200,'None');
            res.status(200).send(apiresponse);
        }
    )
    .catch(
        (err)=>
        {
            res.status(err.status).send(err);
        }
    )


}//end sendNotificationTodayMeeting

module.exports=
{
    addNewMeetingFunction:addNewMeetingFunction,
    updateMeetingFunction:updateMeetingFunction,
    deleteMeetingDetailsFuntion:deleteMeetingDetailsFuntion,
    getAllMeetingDetails:getAllMeetingDetails,
    getMeetingDetails:getMeetingDetails,
    sendNotificationTodayMeeting:sendNotificationTodayMeeting
   

}