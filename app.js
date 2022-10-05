const express = require('express')
const data = require('./data.js')
const expressHandlebars = require("express-handlebars")
const expressSession = require("express-session")
const bodyPaser = require('body-parser')
const sqlite3 = require('sqlite3')

const db = new sqlite3.Database("my-website-db.db")
const app = express()

//middleware function 
///send the file to the browser
app.use(
    express.static('public')
)

app.use(bodyPaser.urlencoded({
  extended: false
}))

app.use(expressSession({
    secret:"ekeleslfmsldmadassdafggg", 
    saveUninitialized: false,
    resave: false
}))

db.run(`
    	CREATE TABLE IF NOT EXISTS COMMENTS (
        id INTEGER PRIMARY KEY,
        name TEXT,
        comment TEXT
    )
`)

const comments = [
    {id: 1, name: "kiarash", comment: "this is good website"},
    { id: 2, name: "mm", comment: "this is not good website"}
]

//username and password
const actualusername = "kiarash"
const actualpassword = "Admin"

//rendering engine
app.engine('hbs', expressHandlebars.engine({
    defaultLayout: "main.hbs" , 
}))

app.get('/', function(request, response){
    const model = {
        session: request.session
    }

    response.render('start.hbs', model) // you can make the sprate file of HTML and specify the name to open here
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
    const query = "SELECT * FROM COMMENTS"

    db.all(query, function(error, comments){
        const model = {
            comments: comments
        }
    
        response.render('guestBook.hbs', model)
    })
})

app.post("/guestBook", function(request, response){
    const name = request.body.name
    const comment = request.body.comment

    const query=`INSERT INTO COMMENTS (name, comment) VALUES (?,?); `
    const VALUES = [name , comment]

    db.run(query, VALUES, function(error){
        response.redirect("/guestBook")
    })
})

app.get("/guestBook/:id", function(request, response){

    const id = request.params.id

    const query = `SELECT * FROM comments WHERE id = ?`
    const VALUES = [id]

    db.get(query , VALUES, function(error, comments){

        const model = {
            comments
        }
        response.render('guestBook.hbs', model)
    })
})

//login 
app.get('/login', function (request, response){
    response.render('login.hbs')
})

app.post('/login', function (request, response){
    const realusername = request.body.username
    const realpassword = request.body.password

    if(realusername == actualusername && realpassword == actualpassword){
        request.session.isLoggedIn = true
        response.redirect('/')
    }else{
        //err messg
        response.render('login.hbs')
    }
})

app.listen(8080)