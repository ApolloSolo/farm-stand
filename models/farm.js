const mongoose = require('mongoose');
const {Schema} = mongoose;
const Product = require('./product') //Need this for delete middleware

const farmSchema = new Schema({
    name: {
        type: String,
        required: [true, "You must enter a farm name"]
    },
    city: {
        type: String
    },
    email: {
        type: String
    },
    products: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Product'
        }
    ]
})

//Delete middleware
farmSchema.post('findOneAndDelete', async function(farm) {
    if(farm.products.length){
        const res = await Product.deleteMany({ _id: { $in: farm.products } }) //delete all products where their _id is in the products array we just deleted
        console.log(res);
    }
})

const Farm = new mongoose.model('Farm', farmSchema);

module.exports = Farm; 