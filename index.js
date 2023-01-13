const express =require('express');
const app = express();
const AppError = require ('./apperror')
const { v4: uuidv4 } = require('uuid');
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
const path = require('path');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
var methodOverride = require('method-override');
app.use(methodOverride('_method'));
const mongoose = require('mongoose');

const Farm = require('./models/farm');

const FarmProduct = require ('./models/product') 

const categories = ['fruit','vegetable', 'dairy', 'baked']

function wrapAsync(fn){
    return function (req,res,next){
        fn(req,res,next).catch(e => next (e))
    }
}

// FARM ROUTES

app.get ('/farms' , async (req,res) =>{
    const farms = await Farm.find({});
    res.render('farms/index', {farms})
})

app.get('/farms/new' , (req,res) =>{
   
    res.render('farms/new')
})

app.get ('/farms/:id' , async (req,res) =>{
    const {id} = req.params;
    const farm = await (await Farm.findById(id)).populate('products');
    console.log("show farm is" , farm)
    res.render('farms/show' , { farm })
})

app.delete ('/farms/:id' , async (req,res) =>{
    const {id} = req.params;
    console.log("Deleting...")
    const deleteFarmResults = await Farm.findByIdAndDelete(id)
res.redirect ('/farms')
})

app.post('/farms' , async(req,res)=>{

    const farm = new Farm(req.body)
   await farm.save();
   res.redirect('/farms')
})



app.get('/farms/:id/products/new' , async (req,res) =>{
    const {id} = req.params
    const farm = await Farm.findById(id) 
    console.log('Farm is ' , farm)
    res.render('products/new', { categories, farm})
})

app.post ('/farms/:id/products' , async (req,res) =>{
    const { id } = req.params;
    const farm = await Farm.findById(id)
const { name, price, category} = req.body;

const product = new FarmProduct({name,price,category});
farm.products.push(product);
product.farm = farm;
await farm.save();
await product.save()
// res.send(farm)

res.redirect(`/farms/${id}`)
    

})

// PRODUCT ROUTES


// Connect to Db

main().catch(err => console.log('OH NO ERROR', err));
async function main () {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/farmersproduct');
    console.log("Mongo connection Open")

    }

    catch (err) {
        console.log  ("Oh No Error!!! ", err)
    }
    
}

// Step 1 : To get All Products 
app.get ('/products' , async (req,res ,next) =>{
    try {
    const {category} = req.query;

    if (category) {
        const products = await FarmProduct.find({category : category});
        res.render('products/index', {products,category})
    }

    else {
        const products = await FarmProduct.find();
        res.render ('products/index', {products, category: 'All Category'})
    }
}
catch (e){
    next (e)
}
    // //db.collections.find()
    // const products = await FarmProduct.find();
    // //console.log('The products are ', products )
    // res.render('products/index', {products,category})
})

// Step 2: Add a New Product
// Step 2a : Render a page to add new Product

app.get ('/products/new' , async (req,res) =>{
    //throw new AppError('NOT ALLOWED',401)
    res.render ('products/new', {categories})
})

//Step 2b: Add the new product and back to main page
app.post('/products', async(req,res,next) =>{
    try {

    console.log ('the request body is ', req.body)
    const {name,price,category} = req.body;
    const addedProduct = await new FarmProduct({name,price,category}).save();
    console.log ('Added product is ',addedProduct)
    res.redirect('/products')
}catch (e){
    
    console.log (`the error is ${e}`)
    next (e)
}
})

// Step 4: Update the product
// Step 4a. Render the page to update 

app.get ('/products/:id/edit' , wrapAsync (async (req,res,next)=>{
    
    const {id} = req.params;
    //find the product using the id 
    // db.collection.findbyId()
    const foundProductToUpdate = await FarmProduct.findById(id);
    if (!foundProductToUpdate){
        throw new AppError('Product Not Found', 404)
    }
    
    console.log ('foundProduct to update', foundProductToUpdate)
    res.render ('products/edit' , {foundProductToUpdate,categories})
}))


app.put ('/products/:id' , async(req,res,next) =>{
    try {
    const {id} = req.params;
    const {name,price,category} = req.body;
    const updateProduct = await FarmProduct.findByIdAndUpdate(id,{name,price,category}, {new: true, runValidators: true})
    res.redirect(`/products/${id}`)
}
catch (e){
    
    next (e)
}

})
// Step 3 : Show details of single product

app.get ('/products/:id', async (req,res,next) =>{
    try {

    
    //console.log ('the parameter is' , req.params)
    const {id} = req.params
    //db.collections.findbyId()
    const foundProduct = await FarmProduct.findById(id).populate('farm','name')
    console.log (  'the products are in ' , foundProduct)
    if (!foundProduct){
        //return next ( new AppError('Product Not Found', 404))
       throw  new AppError('Product Not Found', 404)
    }
    console.log ('the found product is ', foundProduct)
    
    res.render('products/show', {foundProduct})
}
catch (e){
    next (e)
}
})

// Step 5: Deleting the product

app.delete ('/products/:id', async (req,res) =>{
    const {id} = req.params;
    const foundProductToDelete = await FarmProduct.findByIdAndDelete(id);
    res.redirect ('/products')

})

const handleValidationErr = err =>{
    console.dir(err)
    return new AppError(`Validation Failed ... ${err.message}`, 400)
}

// mongoose related error 
app.use((err,req,res,next)=>{
    console.log(err.name);
    if (err.name ==='ValidationError') err = handleValidationErr(err)
    next(err)
})

app.use ((err,req,res,next) =>{
    const {status=404,message='ERROR! Not Found'} = err
    res.status(status).send(message)
})
app.listen(3006,()=>{
    console.log("Listening on port 3006");

})
