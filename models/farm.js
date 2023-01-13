const mongoose = require('mongoose');
const {Schema} = mongoose;
const FarmProduct = require ('./product') 
const farmSchema = new Schema ({
    name: {
        type: String,
        required: [true, 'Farm must have a name']
    },
    city : {
        type: String,

    }, 

    email : {
        type: String,
        required: [true,'Email Required']
    },

    products: [
        {
            type: Schema.Types.ObjectId,
            ref: 'FarmProduct'
        }
    ]

    
})
//

farmSchema.pre('findOneAndDelete' , async function (farm){
    console.log ("PRE MIDDLEWARE")
    console.log(farm)
    

})

farmSchema.post('findOneAndDelete' , async function (farm) {
    console.log ("POST MIDDLEWARE")
    console.log(farm)
    if (farm.products.lengeth) {
       const deleteFarmProduct = FarmProduct.deleteMany({_id: { $in : farm.products}});
       console.log(deleteFarmProduct)
        
    }
    

})

const Farm = mongoose.model('Farm', farmSchema);
module.exports = Farm;