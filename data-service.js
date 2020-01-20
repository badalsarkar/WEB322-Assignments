let Sequelize=require('sequelize');
const env= require('dotenv');
env.config();


//database setup
let sequelize = new Sequelize(process.env.SequelizeDB, process.env.SequelizeUser, process.env.Sequelize.Pass,{
    host:process.env.SequelizeHost,
    dialect:'postgres',
    port:5432,
    dialectOptions:{ssl:true}
});


//Database model for employee
let Employee= sequelize.define('employee',{
    employeeNum:
        {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: Sequelize.STRING,
    SSN: Sequelize.STRING,
    addressStreet: Sequelize.STRING,
    addressCity: Sequelize.STRING,
    addressState: Sequelize.STRING,
    addressPostal: Sequelize.STRING,
    maritialStatus: Sequelize.STRING,
    isManager: Sequelize.BOOLEAN,
    employeeManagerNum: Sequelize.INTEGER,
    status: Sequelize.STRING,
    hireDate: Sequelize.DATEONLY
});




//Database model for department
let Department= sequelize.define('department',{
    departmentId:
    {
        type: Sequelize.INTEGER,
        primaryKey:true,
        autoIncrement: true
    },
    departmentName: Sequelize.STRING,
});

//relationship between department and employee
//department has many employee 
Department.hasMany(Employee, {foreignKey:'department'});


//exporting function
module.exports={
    initialize: function (){
        return new Promise((resolve,reject)=>{
           sequelize.sync().
                then(function(){
                    resolve("Database connection successfu");
                }).
                catch(function(){
                    reject("unable to sync database");
                });
        });
    },
    getAllEmployees: function(){
        return new Promise((resolve,reject)=>{
            Employee.findAll().
                then(employees=>{
                    resolve(employees);
                }).
                catch((err)=>{
                    reject("Error reading employee data");
                });
        });
    },
    //this function returns employee details based on 
    //status parameter
    getEmployeeByStatus:function(sts){
        return new Promise((resolve, reject)=>{
            Employee.findAll({where:{status:sts}}).
                then(employees=>{
                    resolve(employees);
                }).
                catch(()=>{
                    reject("Error reading data");
                });
        });
    },
    //this function provides employee data
    //by department
    getEmployeeByDepartment:function(department){
        return new Promise((resolve, reject)=>{
            Employee.findAll({where:{department:department}}).
                then(employees=>{
                    resolve(employees);
                }).
                catch(()=>{
                    reject("Error reading data");
                });
        });
    },
    //this function provides employee data
    //based on managers
    getEmployeeByManager:function(manager){
        return new Promise((resolve, reject)=>{
            Employee.findAll({where:{employeeManagerNum:manager}}).
                then(employees=>{
                    resolve(employees);
                }).
                catch(()=>{
                    reject("Error reading data");
                });
        });
    },
    //this function returns the employee data based
    //on employee number
    getEmployeeByNum:function(num){
        return new Promise((resolve, reject)=>{
            Employee.findAll({where:{employeeNum:num}}).
                then(employee=>{
                    resolve(employee[0]);
                }).
                catch(()=>{
                    reject("Error reading data");
                });
        });
    },
    //this function provides a employee information
    //who has a manager
    getManagers: function(){
        let managers=new Array;
        return new Promise((resolve,reject)=>{
            reject();
        });
    },
    //this function provides department information
    getDepartments: function(){
        return new Promise((resolve,reject)=>{
            Department.findAll().
                then(departments=>{
                    resolve(departments);
                }).
                catch(()=>{
                    reject("Error reading data");
                });
        });
    },

    //this function provides extracts department data for provided 
    //department id
    getDepartmentById: function(id){
        return new Promise((resolve,reject)=>{
            Department.findAll({where:{departmentId:id}}).
                then(departments=>{
                    resolve(departments[0]);
                }).
                catch((err)=>{
                    reject(err);
                });
        });
    },

    //this function deletes specific department from database
    deleteDepartmentById:function(id){
        return new Promise ((resolve, reject)=>{
            Department.destroy({where:{departmentId:id}}).
                then(()=>{
                    resolve(`Department ${id} is deleted successfully`);
                }).
                catch(()=>{
                    reject(`Unable to delete department ${id}`);
                });
        });
    },

    //this function receives data from request body
    //modifies the data
    //insert the data into employee table
    //resolves the promise
    addEmployee:function(employeeData){
        return new Promise((resolve,reject)=>{
            //if any property has empty value, replace it with null
            for(const prop in employeeData){
                if(employeeData[prop]=="")
                    employeeData[prop]=null;
            }
            //if isManager is not set, set it as false
            employeeData.isManager=(employeeData.isManager)?true:false;
            //now add the data to table
            Employee.create({
                firstName:employeeData.firstName,
                lastName:employeeData.lastName,
                email:employeeData.email,
                SSN:employeeData.SSN,
                addressStreet:employeeData.addressStreet,
                addressCity:employeeData.addressCity,
                addressState:employeeData.addressState,
                addressPostal:employeeData.addressPostal,
                maritialStatus:null,
                isManager:employeeData.isManager,
                employeeManagerNum:employeeData.employeeManagerNum,
                status:employeeData.status,
                hireDate:employeeData.hireDate,
                department:employeeData.department
            }).
                then((employee)=>{
                    resolve("Employee added successfully");
                }).
                catch((err)=>{
                    reject("Unable to create employee");
                });
    });
},

    //this method cleans the employee data to replace "" with null
    //and set isManager to either true or false
    //then updates employee information
    updateEmployee:function(employeeData){
        return new Promise((resolve,reject)=>{
            //if any property has empty value, replace it with null
            for(const prop in employeeData){
                if(employeeData.prop=='')
                    employeeData.prop=null;
            }
            console.log(employeeData);
            //if isManager is not set, set it as false
            employeeData.isManager=(employeeData.isManager)?true:false;
            //now update the record in database
            Employee.update(employeeData,{where:{employeeNum:employeeData.employeeNum}}).
                then(()=>{
                    resolve("Employee data update successful");
                }).
                catch((err)=>{
                    reject("Unable to update employee data");
                });
        });
    },


    /*this method adds new department information
    */
    addDepartment:function(departmentData){
        return new Promise((resolve,reject)=>{ 
            //replace all empty value with null
            for(const prop in departmentData){
                if(departmentData[prop]=="")
                    departmentData[prop]=null;
            }
            //add the record to the database
            Department.create({
                departmentName:departmentData.departmentName}).
                then(()=>{
                    resolve("New department added successfully");
                }).
                catch(()=>{
                    reject("Unable to create department");
                });
        });
    },

    /*
    This method updates department record
    */
    updateDepartment:function(departmentData)
    {
        return new Promise ((resolve, reject)=>
        {
            //replace all empty value with null
            for(const prop in departmentData)
            {
                if(departmentData.prop=="")
                    departmentData.prop=null;
            }
            //update the record in database
            Department.update
            (
                {
                    departmentId:departmentData.departmentId,
                    departmentName:departmentData.departmentName
                },
                {
                    where:{departmentId:departmentData.departmentId}
                }
            ).
            then(()=>
            {
                resolve("Department updated successfully");
            }).
            catch(()=>
            {
                reject("Unable to update department");
            });
        });
    },

    //delete employee
    //this function deletes specified employee from database
    deleteEmployeeByNum:function(empNum)
    {
        return new Promise((resolve,reject)=>{
            Employee.destroy({where:{employeeNum:empNum}}).
                then((res)=>{
                    resolve(`Removed employee ${empNum} from database`);
                }).
                catch((err)=>{
                    reject("Unable to remove employee");
                });
        });
    }


};
