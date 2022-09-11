const express = require('express')
const { get } = require('express/lib/response')
const data = require ('./data.js')
const expressHandlebars = require ("express-handlebars")

const app = express()

//rendering engine
app.engine ('hbs', expressHandlebars.engine({
    defaultLayout: "main.hbs" , 
}))

app.get('/', function(request, response){
    response.render('start.hbs') // you can make the sprate file of HTML and specify the name to open here
})

app.get('/movies', function(request, response){
    const model = {
        movies: data.movies
    }
})


//get req for the movies one or two or...
app.get ("/movies/:id", function(request, response){

    const id = request.params.id

    data.movies.find (m => m. id == id)

    const model = {
        movie:movie,
    }

    response.render('movie.hbs', model)

})

//middleware function
app.use(
    express.static('public')
)

app.listen(8080)