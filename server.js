/*********************************************************************************
* I declare that this assignment is my own work in accordance with Seneca Academic Policy.
* No part of this assignment has been copied manually or electronically from any other source
* (including web sites) or distributed to other students.
*
* Name: Badal Sarkar     Student ID: 137226189      Date: November 14, 2019
*
* Online (Heroku) URL:https://dreadful-mansion-01843.herokuapp.com/
*
********************************************************************************/ 

const express =require('express');
const path=require('path');
const dataService=require('./data-service.js');
const dataServiceAuth=require('./data-service-auth.js');
const port=process.env.PORT||8080;
const multer=require('multer');
const fs=require('fs');
const bodyParser=require('body-parser');
const exphbs=require('express-handlebars');
const Sequelize=require('sequelize');
const clientSessions=require('client-sessions');
let app=express();


//parser the request body
app.use(bodyParser.urlencoded({extended:true}));

//defining static resource
app.use(express.static('public'));


//multer setup
const storage=multer.diskStorage({
    destination:path.join(__dirname, '/public/images/uploaded'),
    filename:function(req,file,cb){
        //question: what is cb?
        cb(null, Date.now()+path.extname(file.originalname));
    }
});

let upload=multer({storage:storage});

//handlebar setup
app.engine('.hbs', exphbs({
    extname:'.hbs',
    defaultLayout:'main',
    helpers:{
        navLink: function(url, options){
             return '<li' +
                 ((url == app.locals.activeRoute) ? ' class="active" ' : '') + 
                 '><a href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function (lvalue, rvalue, options) {
             if (arguments.length < 3)
                 throw new Error("Handlebars Helper equal needs 2 parameters");
             if (lvalue != rvalue) {
                 return options.inverse(this);
             }
            else {
                return options.fn(this);
            }
        }
    } //end of helpers
}));
app.set('view engine', '.hbs');


//clientSession setup
app.use(clientSessions({
    cookieName:"session",
    secret:"web322assignment6_thefinalassignment",
    duration: 2*60*1000,         //session remain active for 2 minutes(in miliseconds)
    activeDuration: 1000*60     //session extended by 1 minute with each request
}));


//attach session object as local variable to the response
//this allows us to access these variables while rendering views
//check (https://expressjs.com/en/api.html#res.locals)
app.use((req,res,next)=>{
    res.locals.session=req.session;
    next();
});

//ensurelogin function
//this function checks if an user is logged in or not
function ensureLogin(req, res, next){
    if(!req.session.user)
    {
        res.redirect("/login");
    }
    else
    {
        next();
    }
}


//for fixing the active item
//in the main layout
app.use(function(req,res,next){
     let route = req.baseUrl + req.path;
     app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, "");
     next();
});


//routing
//home route
app.get('/',(req, res)=>{
    res.render('home');
});


//about route
app.get('/about', (req,res)=>{
    res.render('about');
});



//employee route
app.get('/employees',ensureLogin,(req,res)=>{
    //extract query sting
    let queryString=req.query;
    //if there is status in query string
    if(queryString.status!=undefined){
        //call getEmployeeByStatus
        dataService.getEmployeeByStatus(queryString.status).
            then(employees=>{
                //if there is data show data,
                //if there is no data show message
                if(employees.length>0){
                    res.render('employees',{employees:employees});
                }
                else{
                    res.render('employees',{message:"No data found"});
                }
            }).
            catch(err=>{
                res.render('employees',{message:err});
            });
    }
    //if there is department in query string
    else if(queryString.department!=undefined){
        //call getEmployeeByDepartment
        dataService.getEmployeeByDepartment(queryString.department).
            then(employees=>{
                //if there is data show data,
                //if there is no data show message
                if(employees.length>0){
                    res.render('employees',{employees:employees});
                }
                else{
                    res.render('employees',{message:"No data found"});
                }
            }).
            catch(err=>{
                res.render('employees',{message:err});
            });
    }
    //if there is manager in query string
    else if(queryString.manager!=undefined){
        //call getEmployeeByManager
        dataService.getEmployeeByManager(queryString.manager).
            then(employees=>{
                //if there is data show data,
                //if there is no data show message
                if(employees.length>0){
                    res.render('employees',{employees:employees});
                }
                else{
                    res.render('employees',{message:"No data found"});
                }
            }).
            catch(err=>{
                res.render('employees',{message:err});
            });
    }
    //if there is nothing in query string
    else{
        //call getAllEmployees
        dataService.getAllEmployees().
            then(employees=>{
                //if there is data show data,
                //if there is no data show message
                if(employees.length>0){
                    res.render('employees',{employees:employees});
                }
                else{
                    res.render('employees',{message:"No data found"});
                }
            }).
            catch(err=>{
                res.render('employees',{message:err});
            });
        }
});



//employee/add route
app.get('/employees/add',ensureLogin,(req,res)=>{
    //get department data
    dataService.getDepartments().
        then(departments=>{
            res.render('addEmployee',{departments:departments});
        }).
        catch(()=>{
            res.render('addEmployee',{departments:[]});
        });
});



//employee:value route
//this function handles get request with dynamic value 
app.get('/employee/:employeeNum',ensureLogin,(req,res)=>{
    //create an empty object
    let viewData={};
    dataService.getEmployeeByNum(req.params.employeeNum).
        then(employee=>{
            viewData.employee=employee.dataValues;
        }).
        catch(()=>{
            viewData.employee=null;
        }).
        then(dataService.getDepartments).
        then(departments=>{
            viewData.departments=departments;
            //loop through department data to find the department that 
            //is same as employees department
            //add a property "selected" to that department
            for(let i=0; i<viewData.departments.length;i++){
                if(viewData.departments[i].dataValues.departmentId==viewData.employee.department){
                    viewData.departments[i].selected=true;
                }
            }
        }).
        catch(()=>{
            viewData.departments=[];
        }).
        then(()=>{
            if(viewData.employee==null){
                res.status(404).send("Employee Not Found");
            }
            else{
                console.log(viewData);
                res.render('employee',{viewData:viewData});
            }
        });
});

//delete employee route
app.get('/employees/delete/:empNum',ensureLogin,(req,res)=>{
    dataService.deleteEmployeeByNum(req.params.empNum).
        then(()=>{
            res.redirect('/employees');
        }).
        catch(()=>{
            res.status(500).send("Unable to Remove Employee/ Employee not found");
        });
});



//departments route
app.get('/departments',ensureLogin,(req,res)=>{
    dataService.getDepartments().
        then(departments=>{
            if(departments.length>0){
                res.render('departments',{departments:departments});
            }
            else{
                res.render('departments',{message:"No data found"});
            }
        }).
        catch(err=>{
            res.render('departments',{message: err});
        });
});


//get department:value
app.get('/department/:departmentId',ensureLogin,(req,res)=>{
    dataService.getDepartmentById(req.params.departmentId).
        then((department)=>{
            if(department){
                console.log(department.dataValues.departmentName);
                res.render('department',{department:department.dataValues});
            }
            else{
                res.status(404).send("Department not found");
            }
        }).
        catch((err)=>{
            res.status(404).send(err);
        });
});


//delete department
app.get('/departments/delete/:departmentId',ensureLogin,(req, res)=>{
    dataService.deleteDepartmentById(req.params.departmentId).
        then(()=>{
            res.redirect('/departments');
        }).
        catch(()=>{
            res.status(500).send("Unable to remove department/ Department not found");
        });
});


//department add route
//provides functionality to add a department
app.get('/departments/add',ensureLogin,(req,res)=>{
    res.render('addDepartment');
});



//images/add route
app.get('/images/add',ensureLogin, (req,res)=>{
    res.render('addImage');
});


//get /images route
app.get('/images',ensureLogin,(req,res)=>{
    fs.readdir("./public/images/uploaded", function(err, items) {
        res.render('images',{images:items});
    });
});



//get login
app.get('/login',(req,res)=>{
    res.render('login');
});



//get register
app.get('/register',(req,res)=>{
    res.render('register');
});




//get logout
app.get('/logout',(req,res)=>{
    req.session.reset();
    res.redirect('/');
});



//get userhistory
app.get('/userHistory',ensureLogin,(req,res)=>{
    res.render('userHistory');
});



//post request
app.post('/images/add',ensureLogin, upload.single("imageFile"), (req, res)=>{
    res.redirect('/images');
});


//post employee
app.post('/employees/add',ensureLogin,(req,res)=>{
    dataService.addEmployee(req.body).
        then(()=>{
            res.redirect('/employees');
        }).
        catch((err)=>{
            res.send(err);
        });
});


//post request for department
//add department
app.post('/departments/add',ensureLogin,(req,res)=>{
    dataService.addDepartment(req.body).
        then(()=>{
            res.redirect('/departments');
        }).
        catch((err)=>{
            res.send(err);
        });
});


//update department
//post request
app.post('/department/update',ensureLogin, (req,res)=>{
    dataService.updateDepartment(req.body).
        then(()=>{
            res.redirect('/departments');
        }).
        catch(err=>{
            res.send(err);
        });
});



//post employee update
app.post('/employee/update',ensureLogin, (req, res)=>{
    dataService.updateEmployee(req.body).
        then(()=>{
            res.redirect("/employees");
        });
});



//post register
app.post('/register',(req,res)=>{
    dataServiceAuth.registerUser(req.body)
    .then(()=>{
        res.render('register',{successMessage:"User Created"});
    })
    .catch(err=>{
        res.render('register',{errorMessage:err, userName:req.body.userName});
    });
});



//post login
app.post('/login',(req,res)=>{
    req.body.userAgent=req.get('User-Agent');
    dataServiceAuth.checkUser(req.body)
    //if user is valid
    .then((validuser)=>{
        //add user information to the session object
        req.session.user={
            userName:validuser.userName,
            email:validuser.email,
            loginHistory:validuser.loginHistory
        };
        res.redirect('/employees');
    })
    .catch(err=>{
        res.render('/login',{errorMessage:err, userName:req.body.userName});
    });
});




//






//for all other route not defined above
app.use((req,res)=>{
    res.status(404).send("Page not found");
});



//starting the server
dataService.initialize()
.then(dataServiceAuth.initialize)
.then(()=>{
    app.listen(port,()=>{
        console.log("Server is listening to port "+port);
    });
})
.catch(err=>{
    console.log(`Unable to start the server: ${err}`);
});

