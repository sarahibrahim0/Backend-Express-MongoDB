const express = require('express');
const { Category } = require('../models/category');
const {Product} = require('../models/product')
const router = express.Router();
const mongoose = require('mongoose')

const multer = require('multer')

const FILE_TYPE_Map  = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg',
  'image/jpg': 'jfif',

}


//get product by id


router.get(`/:id`, async (req,res)=>{
  const product = await Product.findById(req.params.id).populate('category');
  if(!product){
    res.status(401).json('not found')
  }
  res.send(product)
})

//get all products

router.get(`/`, async (req,res)=>{

  let filter = {}
  if(req.query.categories)
{
filter = {category: req.query.categories.split(',') }
}

  const products = await Product.find(filter).populate('category');

  if(!products) {
    res.status(500).json({success: false})
}

  res.send(products)
})






//post product and files

const storage = multer.diskStorage({
  destination: function (req, file, cb) {

    const isValid = FILE_TYPE_Map[file.mimetype];

    let error = new Error('Invalid image type')

    if(isValid)
    {
      error = null;
    }

    cb(error, 'public/uploads')
  },
  filename: function (req, file, cb) {

    //to include certain extensions
    const extension = FILE_TYPE_Map[file.mimetype]
    const fileName = file.originalname.split(' ').join('-');
    cb(null, `${fileName}-${Date.now()}.${extension}`)
  }
})

const uploadOptions = multer({ storage: storage })

router.post(`/`, uploadOptions.single('image'), async(req,res)=>{

    const category = await Category.findById(req.body.category)

    if(!category){return res.status(400).send("Invalid Category")}

    const file= req.file;

    if(!file){return res.status(404).send("image is not found")}


    const fileName = req.file.filename;
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/${fileName}`;

    const product = new Product({
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      image: `${basePath}`,
      brand: req.body.brand,
      price: req.body.price,
      category: req.body.category,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      numReviews: req.body.numReviews,
      isFeatured: req.body.isFeatured,
    })

    await product.save();
    if(product){
     return res.status(200).send(product)
    }
    else{
     return res.status(402).json({success: false, message:"product wasn't created"})}

})



//post product gallery images

router.put(`/gallery-images/:id`,uploadOptions.array('images', 10),async(req,res)=>{

  if(!mongoose.isValidObjectId(req.params.id))
  { return res.status(404).json({success: false, message:"invalid product id"})}


  let imagesPaths = []
  const files = req.files;
  const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

if(files){
  files.forEach(file=>{

     imagesPaths.push(`${basePath}${file.filename}`)

  })
}

  const product = await Product.findByIdAndUpdate(req.params.id,
    {
      images : imagesPaths
    },
    {
      new : true
    })

    if(product){
      return res.status(200).send(product)
    }
    else{
      return res.status(404).json({success: false, message:"product not found"})
    }

})


//edit product

router.put(`/:id`,uploadOptions.single('image'),async(req,res)=>{

  if(!mongoose.isValidObjectId(req.params.id))
  { return res.status(404).json({success: false, message:"invalid product id"})}


  const category = await Category.findById(req.body.category)
  if(!category){return res.status(400).send("Invalid Category")}

  const product = await Product.findById(req.params.id);
  if (!product) return res.status(400).send('Invalid Product!');

  const file = req.file;
  let imagePath

  if(file){
    const fileName = file.filename
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/${fileName}`;
    imagePath = basePath;

  }

  else{
    imagePath = product.image
  }


  const updatedProduct = await Product.findByIdAndUpdate(req.params.id,
    {
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      image: imagePath,
      brand: req.body.brand,
      price: req.body.price,
      category: req.body.category,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      numReviews: req.body.numReviews,
      isFeatured: req.body.isFeatured,

    },
    {
      new : true
    })

    if(updatedProduct){
      return res.status(200).send(updatedProduct)
    }
    else{
      return res.status(404).json({success: false, message:"product not found"})
    }

})

//delete products

router.delete(`/:id`,(req,res)=>{

  if(!mongoose.isValidObjectId(req.params.id))
  { return res.status(404).json({success: false, message:"invalid product id"})}


  Product.findByIdAndRemove(req.params.id).then(product=>{
    if(product){
      return res.status(200).send(product)
    }
    else{
      return res.status(404).json({success: false, message:"product not found"})
    }
  }).catch(err=>{
    return res.status(500).json({success: false, message: err})
  })
})


//get count of products

router.get(`/get/count`, async (req,res)=>{

  const productCount = await Product.countDocuments();

    if(!productCount){
    res.status(500).json({success:false})
    }

    else{
   res.send({productCount : productCount})
    }

  })

  //featured products

  router.get(`/get/featured/:count`, async (req,res)=>{

    const count = req.params.count ? req.params.count : 0 ;

    //limiting the number of featured products

    const products = await Product.find({isFeatured : true }).limit(+count)
    if(!products){
      res.status(401).json('not found')
    }
    res.send(products)
  })


module.exports = router;
