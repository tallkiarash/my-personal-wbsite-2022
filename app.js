const express = require('express')
const data = require('./data.js')
const expressHandlebars = require("express-handlebars")
const expressSession = require("express-session")
const bodyPaser = require('body-parser')
const sqlite3 = require('sqlite3')
const req = require('express/lib/request')

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



app.get('/portfolio', function (request, response){
    const query = "SELECT * FROM PORTFOLIO"

    db.all(query, function(error, portfolios){
        const model = {
            portfolios
        }
    
        response.render('portfolio.hbs', model)
    })
})

app.post("/portfolio", function(request, response){
    const name = request.body.name
    const comment = request.body.comment

    const query=`INSERT INTO PORTFOLIO (name, comment) VALUES (?,?); `
    const VALUES = [name , comment]

    db.run(query, VALUES, function(error){
        response.redirect("/portfolio")
    })
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

    const blogPost= {
        comment : newComment,
        name : newName,
        id : id
    }

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
    const query = "SELECT * FROM BLOGPOST"

    db.all(query, function(error, blogPosts){
        const model = {
            blogPosts
        }
    
        response.render('blogPost.hbs', model)
    })
})

app.post("/blogPost", function(request, response){
    const name = request.body.name
    const comment = request.body.comment

    const query=`INSERT INTO BLOGPOST (name, comment) VALUES (?,?); `
    const VALUES = [name , comment]

    db.run(query, VALUES, function(error){
        response.redirect("/blogPost")
    })
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

    const blogPost= {
        comment : newComment,
        name : newName,
        id : id
    }

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

    const query=`INSERT INTO comments (name, comment) VALUES (?,?); `
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

    const comment= {
        comment : newComment,
        name : newName,
        id : id
    }

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