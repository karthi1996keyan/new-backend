const socketio=require('socket.io');

const tokenLib=require('../libs/tokenLib');

const redisLib=require('../libs/redis');

let setServer=(server)=>
{

    let io=socketio.listen(server);
    let myio=io.of('/');


    myio.on('connection',(socket)=>
    {
        socket.emit("verify-user",'');

        socket.on("setuser",(authToken)=>
        {
            tokenLib.compareTokenWithoutSecretKey(authToken,(err,userData)=>
            {

                if(err)
                {
                            
                socket.emit('auth-error',{status: 500, error:"Please provide correct auth token"})

                }
                else
                {
                    let currentUser=userData.data;
                    socket.userId=currentUser.userId;
                    let fullName=currentUser.userName;
                    let key=currentUser.userId;
                    let value=fullName;

                   redisLib.setOnlineNewUsers("ONLINEUSERLISTMEETINGPLANNER",key,value,(err,success)=>
                    {
                        if(err)
                        {
                            console.log('some error occured');
                        }
                        else
                        {
                            redisLib.getAllUserInHash('ONLINEUSERLISTMEETINGPLANNER',(err,allUsers)=>
                            {
                                if(err)
                                {
                                    console.log('Some error occred is redis get all hash');
                                }
                                else
                                {

                                    myio.emit('onlineuserlist',allUsers);
                                    // myio.broadcast.emit('onlineuserlist',allUsers);
                                }
                            });
                        }
                    });
                }

            });
        });//end socket connection

        socket.on('disconnect',()=>
        {
            if(socket.userId)
            {
                
                redisLib.deleteUseFromHash('ONLINEUSERLISTMEETINGPLANNER',socket.userId);
                redisLib.getAllUserInHash('ONLINEUSERLISTMEETINGPLANNER',(err,allUsers)=>
                {
                    if(err)
                    {
                        console.log('Some error occred is redis get all hash');
                    }
                    else
                    {
                        myio.emit('onlineuserlist',allUsers);
                
                    }
                });
            }
        });

        socket.on('notify-updates',(data)=>
        {
            myio.emit(data.userId,data);
        });

    });
}

module.exports=
{
    setServer:setServer
}