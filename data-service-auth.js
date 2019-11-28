var mongoose=require("mongoose");
const bcrypt=require('bcryptjs');
var Schema=mongoose.Schema;

/* database setup */
const password="Yv16gFY2tpq5";
const connectionString=`mongodb+srv://badalsarkar:${password}@cluster0-dthvm.mongodb.net/WEB322?retryWrites=true&w=majority`

//schema for user
var userSchema= new Schema({
    "userName":{
        type:String,
        unique:true
    },
    "password":String,
    "email":String,
    "loginHistory":[{
        "dateTime":Date,
        "userAgent":String
    }]
});

let User;

//export necessary functions
//all the functions are exported as an object
module.exports={
    /**************************************************************** 
    initialize function
    this function ensures that the datase connection is successful
    once it is successful, it initializes the User object
    ******************************************************************/

    initialize:function()
    {
        return new Promise(function(resolve,reject)
        {
            //connecto to db
            let connection1=mongoose.createConnection(connectionString);

            //on failure to connect
            connection1.on('error',(error)=>{
                reject(error);
            });

            //on success to connect
            connection1.once('open', ()=>{
                User=connection1.model("users",userSchema);
                resolve();
            });


        });
    },



    /****************************************************************** 
    registeruser function
    this function is used to register an user. There are two criteria-
    a. the password1 and password2 must match
    b. the user name should not exist in the database
    if both of the criteria are met, an user is registered to the database
    if there is any error, it is communicated to client
    *******************************************************************/
    registerUser:function(userData)
    {
        return new Promise(function(resolve, reject)
        {
            if(userData.password===userData.password2)
            {
                //create a new user
                let newUser = new User(userData);

                bcrypt.genSalt(10,function(err,salt){
                    if(err){
                        reject("There was an error encrypting the password");
                    }
                    else{
                        bcrypt.hash(newUser.password, salt, function(err,hash){
                            if(err){
                                reject("There was an error encrypting the password");
                            }
                            else{
                                newUser.password=hash;
                                //save the newUser
                                newUser.save((err)=>{
                                    if(!err)
                                    {
                                        resolve();
                                    }
                                    else
                                    {
                                        //duplicate key error
                                        if(err.code==11000)
                                        {
                                            reject("User name already taken");
                                        }
                                        else
                                        {
                                            reject(`There was an error creating the user: ${err}`);
                                        }
                                    }
                                });
                            }
                        });
                    }
                });
            }
            //if password did not match
            else
            {
                reject("Passwords don't match");

            }
        });
        
    },



    /****************************************************************
    checkuser function
    this function searches the user name in the database, if 
    found, it matches the password. if the password matches,
    the function creates an entry in the loginhistory property and then
    update the record in the database. 
    incase of any error, it communicates the error back to the client
    ****************************************************************/
    checkUser:function(userData)
    {
        return new Promise(function(resolve, reject)
        {
            //find the user name in db
            User.find({userName:userData.userName}).exec()
            .then(user=>{
                //if user is empty array
                if(user.length==0)
                {
                    reject(`Unable to find user: ${userData.userName}`);

                }
                //compare password
                bcrypt.compare(userData.password,user[0].password)
                .then(res=>{
                    if(res===false){
                        reject(`Incorrect password for user: ${userData.userName}`);
                    }
                    else{
                      //add information to the loginhistory
                       user[0].loginHistory.push({
                           dateTime:(new Date()).toString(),
                           userAgent:userData.userAgent
                       });

                        //update record to reflect change in loginhistory
                        //upon successful update resolve the promise with 
                        User.updateOne(
                            {userName:user[0].userName},
                            {$set:{loginHistory:user[0].loginHistory}}
                        ).exec()
                        .then(()=>{
                            resolve(user[0]);
                        })
                        .catch(err=>{
                            reject(`There was an error verifying the user: ${err}`);
                        });
                    }
                }).catch(err=>{console.log(err);});
            })
            //if the find was rejected
            .catch(err=>{
                console.log(err);
                reject(`Unable to find the user: ${userData.userName}`);
            });
        });
    }
};  //end of object 

