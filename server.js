/*********************************************************************************
* WEB322 – Assignment 4
* I declare that this assignment is my own work in accordance with Seneca Academic Policy.
* No part of this assignment has been copied manually or electronically from any other source
* (including web sites) or distributed to other students.
*
* Name: Badal Sarkar     Student ID: 137226189      Date: October 31, 2019
*
* Online (Heroku) URL:https://
*
********************************************************************************/ 

const express =require('express');
const path=require('path');
const dataService=require('./data-service.js');
const port=process.env.PORT||8080;
const multer=require('multer');
const fs=require('fs');
const bodyParser=require('body-parser');
const exphbs=require('express-handlebars');
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
    //res.sendFile(path.join(__dirname, '/views/home.html'));
    res.render('home');
});


//about route
app.get('/about', (req,res)=>{
    res.render('about');
});



//employee route
app.get('/employees', (req,res)=>{
    //extract query sting
    let queryString=req.query;
    //if there is status in query string
    if(queryString.status!=undefined){
        //call getEmployeeByStatus
        dataService.getEmployeeByStatus(queryString.status).
            then(employees=>{
                res.render('employees',{employees:employees});
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
                res.render('employees',{employees:employees});
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
                res.render('employees',{employees:employees});
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
                res.render('employees',{employees:employees});
            }).
            catch(err=>{
                res.render('employees',{message:err});
            });
        }
});



//employee/add route
app.get('/employees/add', (req,res)=>{
    //res.sendFile(path.join(__dirname, '/views/addEmployee.html'));
    res.render('addEmployee');
});



//employee:value route
//this function handles get request with dynamic value 
app.get('/employee/:value',(req,res)=>{
    dataService.getEmployeeByNum(req.params.value).
        then(employees=>{
            res.render('employee',{employee:employees[0]});
        }).
        catch(err=>{
            res.render('employee',{message:err});
        });
});





//departments route
app.get('/departments', (req,res)=>{
    dataService.getDepartments().
        then(departments=>{
            res.render('departments',{departments:departments});
        }).
        catch(err=>{
            res.render('departments',{message: err});
        });
});



//images/add route
app.get('/images/add', (req,res)=>{
    res.render('addImage');
});


//get /images route
app.get('/images',(req,res)=>{
    fs.readdir("./public/images/uploaded", function(err, items) {
        res.render('images',{images:items});
    });
});




//post request
app.post('/images/add', upload.single("imageFile"), (req, res)=>{
    res.redirect('/images');
});


//post employee
app.post('/employees/add',(req,res)=>{
    dataService.addEmployee(req.body);
    res.redirect('/employees');
});



//post employee update
app.post('/employee/update', (req, res)=>{
    dataService.updateEmployee(req.body).
        then(()=>{
            res.redirect("/employees");
        });
});



//for all other route not defined above
app.use((req,res)=>{
    res.status(404).send("Page not found");
});




//starting the server
dataService.initialize().
    then(()=>{
        app.listen(port,()=>{
            console.log("Server is listening to port "+port);
        });
    }).
    catch(msg=>{
        console.log(msg);
    });

