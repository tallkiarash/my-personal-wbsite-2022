const express = require('express')
const data = require('./data.js')
const expressHandlebars = require("express-handlebars")
const expressSession = require("express-session")
const bodyPaser = require('body-parser')
const sqlite3 = require('sqlite3')
const req = require('express/lib/request')
const SQLiteStore = require('connect-sqlite3')(expressSession);
const bcrypt = require("bcrypt");

const db = new sqlite3.Database("my-website-db.db")
const app = express()

const minCommentsLength = 10
const minNameLength = 5

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
    resave: false,
    store:new SQLiteStore()
}))

//database tables
db.run(`
    	CREATE TABLE IF NOT EXISTS COMMENTS (
        id INTEGER PRIMARY KEY,
        name TEXT,
        comment TEXT
    )
`)

db.run(`
    	CREATE TABLE IF NOT EXISTS PORTFOLIO (
            id INTEGER PRIMARY KEY,
            name TEXT,
            comment TEXT
    )
`)

db.run(`
    	CREATE TABLE IF NOT EXISTS BLOGPOST (
        id INTEGER PRIMARY KEY,
        name TEXT,
        comment TEXT
    )
`)

//username and password
const actualusername = "kiarash"
const actualpassword = "$2b$10$uVoRT4fbtuoY3.N0rDwXQOWPaZqGRQSby5xUZDE0544z5lpVd15GC"

//rendering engine
app.engine('hbs', expressHandlebars.engine({
    defaultLayout: "main.hbs" , 
}))

app.use(function (request, response, next) {
  const isLoggedIn = request.session.isLoggedIn;
  response.locals.isLoggedIn = isLoggedIn;
  next();
})

//login 
app.get('/login', function (request, response){
    response.render('login.hbs')
})

app.post('/login', function (request, response){
    const realusername = request.body.username
    const realpassword = request.body.password
    
    if(realusername == actualusername && bcrypt.compare(realpassword, actualpassword)) {
        
            request.session.isLoggedIn= true;
            response.redirect("/");

    }else{
        const model = {
            failedLogin: true,
        };
        response.render('login.hbs', model);
    }
})

app.get("/logout", function(request, response){
    request.session.isLoggedIn= false
    response.redirect("/login")
})

//first page
app.get('/', function(request, response){
    response.render('start.hbs') // you can make the sprate file of HTML and specify the name to open here
})

//portfolio
app.get('/portfolio', function (request, response){
    const query = "SELECT * FROM PORTFOLIO"

    db.all(query, function(error, portfolios){
        const model = {
            portfolios
        }
    
        response.render('portfolio.hbs', model)
    })
})

function validationErrorsForPortfolio (name , comment){
    const validationErrors = []

    if(name.length <= minNameLength){
        validationErrors.push("name Should at least "+minNameLength+" charachters.")
    }

    if(comment.length <= minCommentsLength){
        validationErrors.push("Comment Should at least "+minCommentsLength+" charachters.")
    }

    return validationErrors
}

app.post("/portfolio", function(request, response){
    const name = request.body.name
    const comment = request.body.comment
    const validationErrors = validationErrorsForPortfolio(name, comment)

    if (validationErrors.length== 0){

        const query=`INSERT INTO PORTFOLIO (name, comment) VALUES (?,?); `
        const VALUES = [name , comment]

        db.run(query, VALUES, function(error){
            response.redirect("/portfolio")
        })
    }else{
        const model ={
            validationErrors,
            name,
            comment
        }
        response.render('portfolio.hbs', model)
    }
})

app.get("/portfolio/:id", function(request, response){

    const id = request.params.id

    const query = `SELECT * FROM PORTFOLIO WHERE id = ?`
    const VALUES = [id];

    db.get(query , VALUES, function(error, portfolio){

        const model = {
            portfolio
        }
        response.render('portfolio.hbs', model)
    })
})

app.get("/update-portfolio/:id" , function(request, response){

    const id = request.params.id;
    const query = `SELECT * FROM PORTFOLIO WHERE id = ?`;
    const VALUES = [id];

    db.get(query, VALUES, function(error , portfolio){
        const model = { portfolio };
        response.render("update-portfolio.hbs", model)
    })
})

app.post("/update-portfolio/:id" , function(request, response){
    const id = request.params.id;
    const newComment = request.body.comment;
    const newName = request.body.name;
    const validationErrors = validationErrorsForPortfolio(newName, newComment)
    
    const portfolio= {
        comment : newComment,
        name : newName,
        id : id
    }

    if(!request.session.isLoggedIn){
        validationErrors.push("you have to log in!")
    }

    if(validationErrors.length == 0){
        const query = ` UPDATE PORTFOLIO SET name =? , comment=? WHERE id =?`;

        
        const VALUES = [
            newName,
            newComment,
            id
        ]
        db.run(query, VALUES, function (error){
            if(error){
                console.log(error)
            } else{
                response.redirect("/portfolio")
            }
        })
    }else{
        const model = { 
            portfolio, 
            validationErrors
        }
        response.render("update-portfolio.hbs", model)
    }

})

app.post("/delete-portfolio/:id", function(request, response){
    const id = request.params.id;

    const query= `DELETE FROM PORTFOLIO WHERE id = ?`;
    db.run(query, [id], function(error){
        if(error){
            console.log(error)
        } 
        else{
            response. redirect("/portfolio")
        }
    })
})

//about me
app.get('/aboutme', function (request, response){
    const model = {
        aboutme: data.aboutme
    }

    response.render('aboutme.hbs', model)
})

//info of me
app.get('/information', function (request, response){
    const model = {
        information: data.information
    }

    response.render('information.hbs', model)
})

//blogpost
app.get('/blogPost', function (request, response){
    const query = "SELECT * FROM BLOGPOST"

    db.all(query, function(error, blogPosts){
        const model = {
            blogPosts
        }
    
        response.render('blogPost.hbs', model)
    })
})

function validationErrorsForBlogPost (name , comment){
    const validationErrors = []

    if(name.length <= minNameLength){
        validationErrors.push("name Should at least "+minNameLength+" charachters.")
    }

    if(comment.length <= minCommentsLength){
        validationErrors.push("Comment Should at least "+minCommentsLength+" charachters.")
    }

    return validationErrors
}

app.post("/blogPost", function(request, response){
    const name = request.body.name
    const comment = request.body.comment
    const validationErrors = validationErrorsForBlogPost(name, comment)

    if (validationErrors.length== 0){
        const query=`INSERT INTO BLOGPOST (name, comment) VALUES (?,?); `
        const VALUES = [name , comment]

        db.run(query, VALUES, function(error){
            response.redirect("/blogPost")
        })
    }else{
        const model ={
            validationErrors,
            name,
            comment
        }
        response.render('blogPost.hbs', model)
    }
})

app.get("/blogPost/:id", function(request, response){

    const id = request.params.id

    const query = `SELECT * FROM BLOGPOST WHERE id = ?`
    const VALUES = [id];

    db.get(query , VALUES, function(error, blogPost){

        const model = {
            blogPost
        }
        response.render('blogPost.hbs', model)
    })
})

app.get("/update-blogPost/:id" , function(request, response){

    const id = request.params.id;
    const query = `SELECT * FROM BLOGPOST WHERE id = ?`;
    const VALUES = [id];

    db.get(query, VALUES, function(error , blogPost){
        const model = { blogPost };
        response.render("update-blogPost.hbs", model)
    })
})

app.post("/update-blogPost/:id" , function(request, response){
    const id = request.params.id;
    const newComment = request.body.comment;
    const newName = request.body.name;
    const validationErrors = validationErrorsForBlogPost(newName, newComment)

    const blogPost= {
        comment : newComment,
        name : newName,
        id : id
    }

    if(!request.session.isLoggedIn){
        validationErrors.push("you have to log in!")
    }

    if(validationErrors.length == 0){
        const query = ` UPDATE BLOGPOST SET name =? , comment=? WHERE id =?`;

        
        const VALUES = [
            newName,
            newComment,
            id
        ]
        db.run(query, VALUES, function (error){
            if(error){
                console.log(error)
            } else{
                response.redirect("/blogPost")
            }
        })
    } else{
        const model = { 
            blogPost, 
            validationErrors
        }
        response.render("update-blogPost.hbs", model)
    }
    
})

app.post("/delete-blogPost/:id", function(request, response){
    const id = request.params.id;

    const query= `DELETE FROM BLOGPOST WHERE id = ?`;
    db.run(query, [id], function(error){
        if(error){
            console.log(error)
        } 
        else{
            response. redirect("/blogpost")
        }
    })
})

//guestbook
app.get('/guestBook', function (request, response){
    const query = "SELECT * FROM COMMENTS"

    db.all(query, function(error, comments){
        const model = {
            comments: comments
        }
    
        response.render('guestBook.hbs', model)
    })
})

function validationErrorsForGuestBook (name , comment){
    const validationErrors = []

    if(name.length <= minNameLength){
        validationErrors.push("name Should at least "+minNameLength+" charachters.")
    }

    if(comment.length <= minCommentsLength){
        validationErrors.push("Comment Should at least "+minCommentsLength+" charachters.")
    }

    return validationErrors
}

app.post("/guestBook", function(request, response){
    const name = request.body.name
    const comment = request.body.comment
    const validationErrors = validationErrorsForGuestBook(name, comment)

    if (validationErrors.length== 0){

        const query=`INSERT INTO comments (name, comment) VALUES (?,?); `
        const VALUES = [name , comment]

        db.run(query, VALUES, function(error){
            response.redirect("/guestBook")
        })
    }else{
        const model ={
            validationErrors,
            name,
            comment
        }
        response.render('guestBook.hbs', model)
    }
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

app.get("/update-comments/:id" , function(request, response){

    const id = request.params.id;
    const query = `SELECT * FROM COMMENTS WHERE id = ?`;
    const VALUES = [id];

    db.get(query, VALUES, function(error , comment){
        const model = { comment };
        response.render("update-comments.hbs", model)
    })
})

app.post("/update-comments/:id" , function(request, response){
    const id = request.params.id;
    const newComment = request.body.comment;
    const newName = request.body.name;
    const validationErrors = validationErrorsForGuestBook(newName, newComment)

    if(!request.session.isLoggedIn){
        validationErrors.push("you have to log in!")
    }
    
    const comment= {
        comment : newComment,
        name : newName,
        id : id
    }
    if(validationErrors.length == 0){
        const query = ` UPDATE COMMENTS SET name =? , comment=? WHERE id =?`;

        
        const VALUES = [
            newName,
            newComment,
            id
        ]
        db.run(query, VALUES, function (error){
            if(error){
                console.log(error)
            } else{
                response.redirect("/guestBook")
            }
        })
    }else{
        const model = { 
            comment, 
            validationErrors
        }
        response.render("update-comments.hbs", model)
    }
})

app.post("/delete-comment/:id", function(request, response){
    const id = request.params.id;

    const query= `DELETE FROM COMMENTS WHERE id = ?`;
    db.run(query, [id], function(error){
        if(error){
            console.log(error)
        } 
        else{
            response. redirect("/guestBook")
        }
    })
})


app.listen(8080)