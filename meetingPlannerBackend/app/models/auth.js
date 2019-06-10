const mongoose=require('mongoose');
const timeLib=require('../libs/timeLib');
const schema=mongoose.Schema;
let authSchema=new schema({

    userId:
    {
        type:String,
        default:''
    },
    authToken:
    {
        type:String,
        default:''
    },
    secretKey:
    {
        type:String,
        default:''
    },
    Createdon:
    {
       type:Date,
       default:timeLib.now()
    },
    modifiedOn:
    {
        type:Date,
        default:timeLib.now()
    }
});

mongoose.model('authModel',authSchema);