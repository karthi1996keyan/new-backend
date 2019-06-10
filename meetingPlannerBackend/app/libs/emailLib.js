
const nodemailer = require("nodemailer");


let sendEmail=(sendMailDetails)=>
{
    let account=
    {
        userName:'karthirajakarthik.k@gmail.com',
        password:'Karthi@1996'
    }

    //create transport and giving credentials 
    //using gmail service
    let transporter=nodemailer.createTransport({
        service:'gmail',
        auth:
        {
            user:account.userName,
            pass:account.password
        }
    });

    let mailOptions=
    {
        from:'"Meeting Planner" Meetingplanner@gmail.com',
        to:sendMailDetails.email,
        subject:sendMailDetails.subject,
        html:sendMailDetails.html
    }

    transporter.sendMail(mailOptions,(err,info)=>
    {
        if(err)
        {
            console.log(err);
        }
        else{
            console.log('Mail sent successfully '+info);
        }
    });
}//end send email

 module.exports=
 {
     sendEmail:sendEmail
 }