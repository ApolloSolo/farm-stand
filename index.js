const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');


const Product = require('./models/product');
const Farm = require('./models/farm');

const categories = ['fruit', 'vegetable', 'dairy', 'baked goods']; //Added categories like baked goods will not work-not valid cat

mongoose.connect('mongodb://localhost:27017/farmStand')
    .then(() => {
        console.log("Mongo Connection Open")
    })
    .catch((e) => {
        console.log("Oh No, Mongo Error Dude")
        console.log(e)
    })

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}))
app.use(methodOverride('_method'))

    //Farm Routes
    app.get('/farms', async (req, res) => {
        const farms = await Farm.find({});
        res.render('farm/index', { farms }); 
    })

    app.get('/farms/new', (req, res) => {
        res.render('farm/new');
    })

    app.post('/farms', async (req, res) => {
        const newFarm = new Farm(req.body);
        await newFarm.save();
        res.redirect('/farms');
    })

    app.get('/farms/:id/index', async (req, res) => {
        const {id} = req.params
        const farm = await Farm.findById(id).populate('products');
        res.render('farm/show', {farm}); 
    })

    app.delete('/farms/:id', async (req, res) => {
        const { id } = req.params
        const deletedFarm = await Farm.findByIdAndDelete(id);
        
        res.redirect('/farms');
    })

    app.get('/farms/:id/products/new', async (req, res) => {
        const {id} = req.params;
        const farm = await Farm.findById(id);
        res.render('products/new', {categories, farm})
    })

    app.post('/farms/:id/products', async (req, res) => {
        const { id } = req.params // this is farm id
        const farm = await Farm.findById(id);
        const { name, price, category } = req.body;
        const product = await new Product({name, price, category})
        farm.products.push(product);
        product.farm = farm;
        await farm.save();
        await product.save();
        res.redirect(`/farms/${id}/index`);
    })

    //Product Routes

//view all products
app.get('/products', async (req, res) => {
    const {category} = req.query; //query string from show route <a> tag
    if(category){
        const products = await Product.find({category}) //finds all Products based on query string category
        res.render('products/index', { products, category }); //pass in category to display the cat on page
    } else{
        const products = await Product.find({}) //finds all Products
        res.render('products/index', { products, category: "All" }); //Set cat to All for the all products page
    }
})

//Go to add product page
app.get('/products/new', (req, res) => {
    res.render('products/new', { categories });
})

//Adds new product
app.post('/products', async (req, res) => {
    const newProduct = new Product(req.body) //product data is stored in const 
    await newProduct.save(); //Saved to db
    res.redirect(`/products/${newProduct._id}/index`);
})

//view product detail using mongo id
app.get('/products/:id/index', async (req, res) => {
    const { id } = req.params;
    const product = await Product.findById(id).populate('farm', 'name'); //Mongo's built in query
    console.log(product);
    res.render('products/show', { product })
})

//Edit page route
app.get('/products/:id/edit', async (req, res) => {
    const { id } = req.params;
    const product = await Product.findById(id).populate('farm', 'name');
    res.render('products/edit', { product, categories });
})

//Actual edit route
app.put('/products/:id', async (req, res) => {
    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(id, req.body, { runValidators: true, new: true })
    //Alternative to above update: Find by ID and then individualy update the properties and then call .save(), which will run the validators
    res.redirect(`/products/${product._id}/index`);
})

//Delete
app.delete('/products/:id', async (req, res) => {
    const { id } = req.params
    const deletedProd = await Product.findByIdAndDelete(id);
    res.redirect('/products');
})



app.listen(3000, (req, res) => {
    console.log("Connected to 3000")
}) 