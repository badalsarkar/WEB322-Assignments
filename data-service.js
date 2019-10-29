const fs=require("fs");
const path=require("path");

let employee=new Array;
let department=new Array;

//promise for reading employee data            
function read_employee_data(){
    return new Promise((resolve,reject)=>{
        fs.readFile(path.join(__dirname, '/data/employee.json'),'utf8',(err,data)=>{
            if(err){
                reject();
            }
            else{
                employee=JSON.parse(data);
                resolve();
            }
        });
    });
}

//promise for reading department data            
function read_department_data(){
    return new Promise((resolve,reject)=>{
        fs.readFile(path.join(__dirname, '/data/department.json'),'utf8',(err,data)=>{
            if(err){
                reject();
            }
            else{
                department=JSON.parse(data);
                resolve();
            }
        });
    });
}


//exporting function
module.exports={
    initialize: function (){
        return new Promise((resolve,reject)=>{
            read_employee_data().
                then(read_department_data).
                then(function(){
                    resolve('Success');
                }).
                catch(function(){
                    reject('Failure');
                });
        });
    },
    getAllEmployees: function(){
        return new Promise((resolve,reject)=>{
            if(employee.length==0){
                reject('no results returned');
            }
            else{
                resolve(employee);
            }
        });
    },
    //this function returns employee details based on 
    //status parameter
    getEmployeeByStatus:function(status){
        let employeeData=new Array;
        return new Promise((resolve, reject)=>{
            employeeData=employee.filter(emp=>{
                return (emp.status==status);
            });
            if(employeeData.length>0){
                resolve(employeeData);
            }
            else{
                reject("No results returned");
            }
        });
    },
    //this function provides employee data
    //by department
    getEmployeeByDepartment:function(department){
        let employeeData=new Array;
        return new Promise((resolve, reject)=>{
            employeeData=employee.filter(emp=>{
                return (emp.department==department);
            });
            if(employeeData.length>0){
                resolve(employeeData);
            }
            else{
                reject("No results returned");
            }
        });
    },
    //this function provides employee data
    //based on managers
    getEmployeeByManager:function(manager){
        let employeeData=new Array;
        return new Promise((resolve, reject)=>{
            employeeData=employee.filter(emp=>{
                return (emp.employeeManagerNum==manager);
            });
            if(employeeData.length>0){
                resolve(employeeData);
            }
            else{
                reject("No results returned");
            }
        });
    },
    //this function returns the employee data based
    //on employee number
    getEmployeeByNum:function(num){
        let employeeData=new Array;
        return new Promise((resolve, reject)=>{
            employeeData=employee.filter(emp=>{
                return (emp.employeeNum==num);
            });
            if(employeeData.length>0){
                resolve(employeeData);
            }
            else{
                reject("No results returned");
            }
        });

    },
    //this function provides a employee information
    //who has a manager
    getManagers: function(){
        let managers=new Array;
        return new Promise((resolve,reject)=>{
            managers=employee.filter(emp=>{
               return (emp.isManager==true);
            });
            if(managers.length==0){
                reject('no results returned');
            }
            else{
                resolve(managers);
            }
        });
    },
    //this function provides department information
    getDepartments: function(){
        return new Promise((resolve,reject)=>{
            if(department.length==0){
                reject('no results returned');
            }
            else{
                resolve(department);
            }
        });
    },
    //this function receives data from request body
    //modifies the data
    //appends it to the employee array
    //resolves the promise
    addEmployee:function(employeeData){
        return new Promise((resolve,reject)=>{
            //modify the array
            if(employeeData.isManager==undefined){
                employeeData.isManager=false;
            }
            else{
                employeeData.isManager=true;
            }
            //set employee number
            employeeData.employeeNum=employee.length+1;
            //push the array to the employee array
            employee.push(employeeData);
            resolve();
    });
}
};
