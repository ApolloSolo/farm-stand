const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');

const Product = require('./models/product');

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

//view all products
app.get('/products', async (req, res) => {
    const products = await Product.find({}) //finds all Products
    res.render('products/index', { products });
})

//Go to add product page
app.get('/products/new', (req, res) => {
    res.render('products/new');
})

app.post('/products', (req, res) => {
    console.log(req.body);
    res.redirect('/products')
})

//view product detail using mongo id
app.get('/products/:id/index', async (req, res) => {
    const { id } = req.params;
    const product = await Product.findById(id); //Mongo's built in query
    res.render('products/show', { product })
})

app.listen(3000, (req, res) => {
    console.log("Connected to 3000")
})