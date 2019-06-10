const mongoose=require('mongoose');
const schema=mongoose.Schema;

let mongooseSchema=new schema(
    {
        meetingId:
        {
            type:String,
            default:'',
            index:true,
            unique:true
        },
        hostId:
        {
            type:String,
            default:''
        },
        hostName:
        {
            type:String,
            default:''
        },
        participantId:
        {
            type:String,
            default:''
        },
        participantName:
        {
            
            type:String,
            default:''
        },
        participantEmail:
        {
            type:String,
            default:''
        },
        meetingTitle:
        {
            
            type:String,
            default:''
        },
        meetingDescription:
        {
            
            type:String,
            default:''
        },
        meetingStartDate:
        {
            
            type:Date,
            default:''
        },
        meetingEndDate:
        {
            
            type:Date,
            default:''
        },
        meetingPlace:
        {
            
            type:String,
            default:''
        },
        createdOn:
        {
            type:Date,
            default:Date.now()
        },
        modifiedOn:
        {
            type:Date,
            default:Date.now()
        }

    }
);

mongoose.model('meetingModel',mongooseSchema);