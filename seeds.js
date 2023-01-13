const mongoose = require('mongoose');

const FarmProduct = require ('./models/product') 

// Connect to Db and Add Seed Data

main().catch(err => console.log('OH NO ERROR', err));
async function main () {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/farmersproduct3');
    console.log("Mongo connection Open")

    }

    catch (err) {
        console.log  ("Oh No Error!!! ", err)
    }
    
}

// const p = new FarmProduct({
//     name: 'Ruby Grapefruit',
//     price: 1.99,
//     category: 'fruit'
// }).save().then (res=>{
//     console.log ('New product added' , res)
// }).catch (e => {
//     console.log ('New Product was not added', e)
// })


const seedProducts = [{
    name: 'Fairy Eggplant',
    price: 1.00,
    category: 'vegetable'
}, 
{
    name: 'Sundried Tomato',
    price: 2.00,
    category: 'vegetable'
}, 
{
    name: 'Orange',
    price: 3.99,
    category: 'fruit'
}, 
{
    name: 'Whole milk',
    price: 5.49,
    category: 'dairy'
}, 
{
    name: 'raspberry',
    price: 6.35,
    category: 'fruit'
}, ]

FarmProduct.insertMany(seedProducts).then (res =>{
    console.log ('Multiple Products Inserted' , res)
}). catch ( error => {
    console.log ('Products can not be inserted due to : ', error)
})