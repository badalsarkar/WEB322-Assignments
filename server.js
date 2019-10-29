/*********************************************************************************
* WEB322 – Assignment 3
* I declare that this assignment is my own work in accordance with Seneca Academic Policy.
* No part of this assignment has been copied manually or electronically from any other source
* (including web sites) or distributed to other students.
*
* Name: Badal Sarkar     Student ID: 137226189      Date: October 11, 2019
*
* Online (Heroku) URL:https://mysterious-dusk-06580.herokuapp.com/
*
********************************************************************************/ 

const express =require('express');
const path=require('path');
const dataService=require('./data-service.js');
const port=process.env.PORT||8080;
const multer=require('multer');
const fs=require('fs');
const bodyParser=require('body-parser');
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



//routing
//home route
app.get('/',(req, res)=>{
    res.sendFile(path.join(__dirname, '/views/home.html'));
});


//about route
app.get('/about', (req,res)=>{
    res.sendFile(path.join(__dirname, '/views/about.html'));
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
                res.json(employees);
            }).
            catch(err=>{
                res.json({message:err});
            });
    }
    //if there is department in query string
    else if(queryString.department!=undefined){
        //call getEmployeeByDepartment
        dataService.getEmployeeByDepartment(queryString.department).
            then(employees=>{
                res.json(employees);
            }).
            catch(err=>{
                res.json({message:err});
            });
    }
    //if there is manager in query string
    else if(queryString.manager!=undefined){
        //call getEmployeeByManager
        dataService.getEmployeeByManager(queryString.manager).
            then(employees=>{
                res.json(employees);
            }).
            catch(err=>{
                res.json({message:err});
            });
    }
    //if there is nothing in query string
    else{
        //call getAllEmployees
        dataService.getAllEmployees().
            then(employees=>{
                res.json(employees);
            }).
            catch(err=>{
                res.json({message: err});
            });
        }
});



//employee/add route
app.get('/employees/add', (req,res)=>{
    res.sendFile(path.join(__dirname, '/views/addEmployee.html'));
});



//employee:value route
//this function handles get request with dynamic value 
app.get('/employee/:value',(req,res)=>{
    dataService.getEmployeeByNum(req.params.value).
        then(employees=>{
            res.json(employees);
        }).
        catch(err=>{
            res.json({message:err});
        });
});



//managers route
app.get('/managers', (req, res)=>{
    dataService.getManagers().
        then(managers=>{
            res.json(managers);
        }).
        catch(err=>{
            res.json({message: err});
        });
});



//departments route
app.get('/departments', (req,res)=>{
    dataService.getDepartments().
        then(departments=>{
            res.json(departments);
        }).
        catch(err=>{
            res.json({message: err});
        });
});








//images/add route
app.get('/images/add', (req,res)=>{
    res.sendFile(path.join(__dirname, '/views/addImage.html'));
});


//get /images route
app.get('/images',(req,res)=>{
  /*  dataService.getImageInfo().
        then(allimages=>{
            let imageObj={images:allimages};
            console.log(imageObj);
            let jsonobj=JSON.stringify(imageObj);
            console.log(jsonobj);
            res.json(jsonobj);
        }).
        catch(err=>{
            res.send(err);
            res.end();
        });*/
    fs.readdir("./public/images/uploaded", function(err, items) {
        res.json({images:items});
         
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
