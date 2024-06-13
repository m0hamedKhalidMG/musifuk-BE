const mongoose = require("mongoose");
const hospital = mongoose.model("Hospital");
//const { validationResult } = require('express-validator');
const apperror=require('../handlers/errorHandlers')


exports.getAllHospitals= async(req,res)=>{
    //get courses from db by using models
    //const courses=await course.find({price:{$gt:2600}})
    //const courses=await course.find({price:2600})
    const query=req.query
    const limit= query.limit ||10
    const page=query.page ||1
    const skip=(page-1)*limit;
    const Hospitals=await hospital.find({},{"__v":0}).limit(limit).skip(skip)
  
  
    
    
    //res.send()
    res.json({status:'success',data:{Hospitals}})
}

exports.getHospital= async (req,res,next)=>{
 
        const c=await hospital.findById(req.params.id)
        if(!hospital){
          const err=  apperror.create('error',404,'hospital is not found')
          return next(err)
            }
       
   

       
         
       res.status(200).json({status:'success',data:{c}})
   //}
    }

exports.addHospital=async(req,res,next)=>{

    //console.log(req.body)
//    const error=validationResult(req)
//     if (!error.isEmpty()){
//         const err=apperror.create(error.array(),400,'error')
//         return next(err) 
//     }
    const newHospital=new hospital(req.body)
    await newHospital.save() 
                     
    
        res.status(201).json(newHospital);
    }

    exports.updateHospital=async(req,res)=>{

        const hospitalId=req.params.id;
        
        const updatedhospital= await hospital.findByIdAndUpdate(hospitalId,{$set:{...req.body}})
              
                if(!hospital){
                    return res.status(404).json({msg:'hospital not found'})
                }
              
///////update equipment

            

                res.status(200).json(updatedhospital)
            
            }

 exports.deleteHospital=async(req,res)=>{
       
    const data=await  hospital.deleteOne({_id:req.params.id})
    
   
             
   
     
          
  res.status(200).json({status:'success',data:null})
              }


              exports.updateBeds=async(req,res)=> {
              
            const   {departmentId,hospitalId,newNumberOfBeds}=req.body
                    const Hospital = await hospital.findOne({ _id: hospitalId });
                    if (!Hospital) {
                        throw new Error('Hospital not found');
                    }
    
                    const department = Hospital.departments.find(dep => dep._id == departmentId);
                    if (!department) {
                        throw new Error('Department not found');
                    }
    
                    department.numberOfBeds = newNumberOfBeds;
                    
                    await Hospital.save();
                    console.log('Number of beds updated successfully');
                    res.status(200).json(Hospital)
                    
                } 
          
                exports.addSerumsAndVaccines=async(req,res)=>{

                    const hospitalId=req.params.id;
                    const   {serumOrVaccine}=req.body
                    console.log(serumOrVaccine)
                    //   await hospital.findByIdAndUpdate(
                    //     hospitalId,
                    //     { $push: { serumsAndVaccines: serumOrVaccine } },
                    //     { new: true, useFindAndModify: false }
                    //   );
                      
                 
                      // Find the hospital by ID
                      const Hospital = await hospital.findOne({ _id: hospitalId });
                      if(!Hospital){
                        return res.status(404).json({msg:'hospital not found'})
                    }
                      // Add the new serums and vaccines to the existing array
                  Hospital.serumsAndVaccines.push(...serumOrVaccine);
                  
                      // Save the updated hospital document
                      await Hospital.save();
                      res.status(200).json(Hospital)
                    }
    
            // Example usage
           
      
  
