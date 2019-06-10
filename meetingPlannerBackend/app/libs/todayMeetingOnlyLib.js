
//get only today meeting details

let compareTodayMeetingDate=(data)=>
{

  
    if(new Date(data).getUTCDate() == new Date().getUTCDate() &&  new Date() < new Date(data))
    {
        return true;
    }
    else 
    {
        return false;   
    }

}

module.exports=
{
    compareTodayMeetingDate:compareTodayMeetingDate
} 

