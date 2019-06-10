/**
 * meeting planner application configuration
 */
let appConfig=
{
    port:4500,
    allowedOrgins:'*',
    env:'dev',
    databaseUrl:'mongodb://localhost:27017/meetingplannerdatabase',
    apiVersion:'/api/v1.0.0'

}//end configuration

module.exports=
{
    port:appConfig.port,
    allowedOrgins:appConfig.allowedOrgins,
    env:appConfig.env,
    databaseUrl:appConfig.databaseUrl,
    apiVersion:appConfig.apiVersion
}