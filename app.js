const express = require('express')
const data = require('./data.js')
const expressHandlebars = require("express-handlebars")
const app = express()

//rendering engine
app.engine('hbs', expressHandlebars.engine({
    defaultLayout: "main.hbs" , 
}))

app.get('/', function(request, response){
    response.render('start.hbs') // you can make the sprate file of HTML and specify the name to open here
})

app.get('/portfolio', function(request, response){
    const model = {
        portfolio: data.portfolio
    }
    response.render('portfolio.hbs', model)
})

app.get('/aboutme', function (request, response){
    const model = {
        aboutme: data.aboutme
    }

    response.render('aboutme.hbs', model)
})

app.get('/information', function (request, response){
    const model = {
        information: data.information
    }

    response.render('information.hbs', model)
})

app.get('/blogPost', function (request, response){
    const model = {
        blogPost: data.blogPost
    }

    response.render('blogPost.hbs', model)
})

app.get('/guestBook', function (request, response){
    const model = {
        guestBook: data.guestBook
    }

    response.render('guestBook.hbs', model)
})

app.get('/login', function (request, response){
    const model = {
        login: data.login
    }

    response.render('login.hbs', model)
})

//get req for the movies one or two or...
app.get("/movies/:id", function(request, response){

    const id = request.params.id

    data.movies.find (m => m. id == id)

    const model = {
        movie:movie,
    }

    response.render('movie.hbs', model)
})

//middleware function 
///send the file to the browser
app.use(
    express.static('public')
)

app.listen(8080)