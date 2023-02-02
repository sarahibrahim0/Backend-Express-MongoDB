const express = require('express');
const {Category} = require('../models/category')
const router = express.Router();



//get all categories

router.get(`/`, async (req,res)=>{
    const categoryList = await Category.find();
    if(!categoryList){
      res.status(401).json('not found')
    }
    res.status(200).send(categoryList)
})


//post category
router.post(`/`,async (req,res)=>{
    const category = new Category({
      name: req.body.name,
      icon: req.body.icon,
      color: req.body.color
    })
    // console.log(newProduct);
    await category.save();
    if(!category){
        res.status(500).send('category cannot be created')

}

res.send(category)
})

//delete category

router.delete(`/:id`,(req,res)=>{
  Category.findByIdAndRemove(req.params.id).then(category=>{
    if(category){
      return res.status(200).send(category)
    }
    else{
      return res.status(404).json({success: false, message:"category not found"})
    }
  }).catch(err=>{
    return res.status(500).json({success: false, message: err})
  })
})


//get a certain category

router.get(`/:id`,async(req,res)=>{
  const category = await Category.findById(req.params.id)
    if(category){
      return res.status(200).send(category)
    }
    else{
      return res.status(404).json({success: false, message:"category not found"})
    }

})


//update category

router.put(`/:id`,async(req,res)=>{
  const category = await Category.findByIdAndUpdate(req.params.id,
    {
      name : req.body.name,
      icon: req.body.icon,
      color : req.body.color
    },
    {
      new : true
    })

    if(category){
      return res.status(200).send(category)
    }
    else{
      return res.status(404).json({success: false, message:"category not found"})
    }

})




module.exports = router;
