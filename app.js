const express = require('express')
const data = require('./data.js')
const expressHandlebars = require('express-handlebars')
const expressSession = require('express-session')
const bodyPaser = require('body-parser')
const SQLiteStore = require('connect-sqlite3')(expressSession)
const sqlite3 = require('sqlite3')
const bcrypt = require('bcrypt')

const db = new sqlite3.Database('my-website-db.db')
const app = express()

const minCommentsLength = 10
const minNameLength = 5

//middleware function 
///send the files to the browser
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
    store: new SQLiteStore()
}))

//database tables
db.run(`
    CREATE TABLE IF NOT EXISTS guestbook_comments (
        id INTEGER PRIMARY KEY,
        name TEXT,
        comment TEXT
    )
`)

db.run(`
    CREATE TABLE IF NOT EXISTS portfolio_comments (
        id INTEGER PRIMARY KEY,
        name TEXT,
        comment TEXT
    )
`)

db.run(`
    CREATE TABLE IF NOT EXISTS blogpost_comments (
        id INTEGER PRIMARY KEY,
        name TEXT,
        comment TEXT
    )
`)

//username and password
const correctUsername = "kiarash"
const hashedvalue = "$2b$10$uVoRT4fbtuoY3.N0rDwXQOWPaZqGRQSby5xUZDE0544z5lpVd15GC"

//rendering engine
app.engine('hbs', expressHandlebars.engine({
    defaultLayout: "main.hbs"
}))

app.use(function (request, response, next) {
    const isLoggedIn = request.session.isLoggedIn
    response.locals.isLoggedIn = isLoggedIn
    next()
})

//login 
app.get('/login', function (request, response){
    response.render('login.hbs')
})


app.post('/login', function (request, response){
    const enteredUsername = request.body.username
    const enteredPassword = request.body.password
    
    if (enteredUsername == correctUsername && bcrypt.compareSync(enteredPassword, hashedvalue)) {
        request.session.isLoggedIn = true
        response.redirect("/")
    } else {
        response.redirect('/login')
    }
})

app.post("/logout", function(request, response){
    request.session.isLoggedIn= false
    response.redirect("/login")
})

//first page
app.get('/', function(request, response){
    response.render('start.hbs')
})

//portfolio
app.get('/portfolio', function (request, response){
    const query = "SELECT * FROM portfolio_comments"

    db.all(query, function(error, portfolios){
        const model = {
            portfolios
        }
		if(error){
			console.log(error)
			response.render("error.hbs")
		} else{
			response.render('portfolio.hbs', model)
		}
    })
})

function validationErrorsForPortfolio (name , comment){
    const validationErrors = []

    if(name.length <= minNameLength){
        validationErrors.push("Name should at least "+minNameLength+" characters.")
    }

    if(comment.length <= minCommentsLength){
        validationErrors.push("Comment should at least "+minCommentsLength+" characters.")
    }

    return validationErrors
}

// Everyone should be able to send the post req since everyone must create comments so the name of the db tables are changed!
app.post("/portfolio", function(request, response){
    const name = request.body.name
    const comment = request.body.comment
    const validationErrors = validationErrorsForPortfolio(name, comment)

    if (validationErrors.length== 0){

        const query=`INSERT INTO portfolio_comments (name, comment) values(?,?); `
        const values= [name , comment]

        db.run(query, values, function(error){
            if(error){
                console.log(error)
                response.render("error.hbs")
            } else{
                response.redirect("/portfolio")
            }
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

    const query = `SELECT * FROM portfolio_comments WHERE id = ?`
    const values= [id]

    db.get(query , values, function(error, portfolio){
        if (error){
            console.log(error)
            response.render("error.hbs")
        }else{
            const model = {
                portfolio
            }
            response.render('portfolio.hbs', model) 
        }
    })
})

app.get("/update-portfolio/:id" , function(request, response){

    const id = request.params.id
    const query = `SELECT * FROM portfolio_comments WHERE id = ?`
    const values= [id]

    db.get(query, values, function(error , portfolio){
        if(error){
            console.log(error)
            response.render("error.hbs")
        }else{
            const model = { portfolio }
            response.render("update-portfolio.hbs", model)
        }
    })
})

app.post("/update-portfolio/:id" , function(request, response){
    const id = request.params.id
    const newComment = request.body.comment
    const newName = request.body.name
    const errors = validationErrorsForPortfolio(newName, newComment)
    
    const portfolio= {
        comment : newComment,
        name : newName,
        id : id
    }

    if(!request.session.isLoggedIn){
        errors.push("You have to log in!")
    }

    if(errors.length == 0){
        const query = ` UPDATE portfolio_comments SET name =? , comment=? WHERE id =?`;

        
        const values= [
            newName,
            newComment,
            id
        ]
        db.run(query, values, function (error){
            if(error){
                console.log(error)
                response.render("error.hbs")
            } else{
                response.redirect("/portfolio")
            }
        })
    }else{
        const model = { 
            portfolio, 
            errors
        }
        response.render("update-portfolio.hbs", model)
    }

})

app.post("/delete-portfolio/:id", function(request, response){
    const id = request.params.id

    if(!request.session.isLoggedIn){
        response.redirect("/login")
    }else{
        const query= `DELETE FROM portfolio_comments WHERE id = ?`

        db.run(query, [id], function(error){
        if(error){
            console.log(error)
            response.render("error.hbs")
        } 
        else{
            response. redirect("/portfolio")
        }
    })
    }
})

//about me
app.get('/aboutme', function (request, response){
    response.render('aboutme.hbs')
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
    const query = "SELECT * FROM blogpost_comments"

    db.all(query, function(error, blogPosts){
        const model = {
            blogPosts
        }
		if(error){
			console.log(error)
			response.render("error.hbs")
		} else{
			response.render('blogPost.hbs', model)
		}
    })
})

function validationErrorsForBlogPost (name , comment){
    const validationErrors = []

    if(name.length <= minNameLength){
        validationErrors.push("Name should at least "+minNameLength+" characters.")
    }

    if(comment.length <= minCommentsLength){
        validationErrors.push("Comment should at least "+minCommentsLength+" characters.")
    }

    return validationErrors
}

// Everyone should be able to send the post req since everyone must create comments so the name of the db tables are changed!
app.post("/blogPost", function(request, response){
    const name = request.body.name
    const comment = request.body.comment
    const validationErrors = validationErrorsForBlogPost(name, comment)

    if (validationErrors.length== 0){
        const query=`INSERT INTO blogpost_comments (name, comment) values(?,?); `
        const values= [name , comment]

        db.run(query, values, function(error){
            if(error){
                console.log(error)
                response.render("error.hbs")
            }else{
                response.redirect("/blogPost")
            }
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

    const query = `SELECT * FROM blogpost_comments WHERE id = ?`
    const values= [id]

    db.get(query , values, function(error, blogPost){
        if(error){
            console.log(error)
            response.render("error.hbs")
        }else{
            const model = {
                blogPost
            }
            response.render('blogPost.hbs', model)
        }
    })
})

app.get("/update-blogPost/:id" , function(request, response){

    const id = request.params.id
    const query = `SELECT * FROM blogpost_comments WHERE id = ?`
    const values= [id];

    db.get(query, values, function(error , blogPost){
        if(error){
            console.log(error)
            response.render("error.hbs")
        }else{
            const model = { blogPost }
            response.render("update-blogPost.hbs", model)
        }
    })
})

app.post("/update-blogPost/:id" , function(request, response){
    const id = request.params.id
    const newComment = request.body.comment
    const newName = request.body.name
    const errors = validationErrorsForBlogPost(newName, newComment)

    const blogPost= {
        comment : newComment,
        name : newName,
        id : id
    }

    if(!request.session.isLoggedIn){
        errors.push("You have to log in!")
    }

    if(errors.length == 0){
        const query = ` UPDATE blogpost_comments SET name =? , comment=? WHERE id =?`;

        const values= [
            newName,
            newComment,
            id
        ]
        db.run(query, values, function (error){
            if(error){
                console.log(error)
                response.render("error.hbs")
            } else{
                response.redirect("/blogPost")
            }
        })
    } else{
        const model = { 
            blogPost, 
            errors
        }
        response.render("update-blogPost.hbs", model)
    } 
})

app.post("/delete-blogPost/:id", function(request, response){
    const id = request.params.id

    if(!request.session.isLoggedIn){
        response.redirect("/login")
    } else{
        const query= `DELETE FROM blogpost_comments WHERE id = ?`
        db.run(query, [id], function(error){
            if(error){
                response.render("error.hbs")
                console.log(error)
            }else{
                response. redirect("/blogpost")
            }
        })
    }
})

//guestbook
app.get('/guestBook', function (request, response){
    const query = "SELECT * FROM guestbook_comments"

    db.all(query, function(error, comments){
        const model = {
            comments: comments
        }
		if(error){
			console.log(error)
			response.render("error.hbs")
		} else{
			response.render('guestBook.hbs', model)
		}
    })
})

function validationErrorsForGuestBook (name , comment){
    const validationErrors = []

    if(name.length <= minNameLength){
        validationErrors.push("Name should at least "+minNameLength+" characters.")
    }

    if(comment.length <= minCommentsLength){
        validationErrors.push("Comment should at least "+minCommentsLength+" characters.")
    }

    return validationErrors
}

// Everyone should be able to send the post req since everyone must create comments so the name of the db tables are changed!
app.post("/guestBook", function(request, response){
    const name = request.body.name
    const comment = request.body.comment
    const validationErrors = validationErrorsForGuestBook(name, comment)

    if (validationErrors.length== 0){

        const query=`INSERT INTO guestbook_comments (name, comment) values(?,?); `
        const values= [name , comment]

        db.run(query, values, function(error){
            if(error){
                console.log(error)
                response.render("error.hbs")
            }else{
                response.redirect("/guestBook")
            }
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

    const query = `SELECT * FROM guestbook_comments WHERE id = ?`
    const values= [id]

    db.get(query , values, function(error, comments){
        if(error){
            console.log(error)
            response.render("error.hbs")
        }else{
            const model = {
                comments
            }
            response.render('guestBook.hbs', model)
        }
    })
})

app.get("/update-comments/:id" , function(request, response){

    const id = request.params.id
    const query = `SELECT * FROM guestbook_comments WHERE id = ?`
    const values= [id]

    db.get(query, values, function(error , comment){
        if(error){
            console.log(error)
            response.render("error.hbs")
        }else{
            const model = { comment }
            response.render("update-comments.hbs", model)
        }
    })
})

app.post("/update-comments/:id" , function(request, response){
    const id = request.params.id
    const newComment = request.body.comment
    const newName = request.body.name
    const errors = validationErrorsForGuestBook(newName, newComment)
    
    const comment= {
        comment : newComment,
        name : newName,
        id : id
    }

    if(!request.session.isLoggedIn){
        errors.push("You have to log in!")
    }

    if(errors.length == 0){
        const query = ` UPDATE guestbook_comments SET name =? , comment=? WHERE id =?`;

        const values= [
            newName,
            newComment,
            id
        ]
        db.run(query, values, function (error){
            if(error){
            	console.log(error)
                response.render("error.hbs")
            } else{
                response.redirect("/guestBook")
            }
        })
    }else{
        const model = { 
            comment, 
            errors
        }
        response.render("update-comments.hbs", model)
    }
})

app.post("/delete-comment/:id", function(request, response){
    const id = request.params.id

    if(!request.session.isLoggedIn){
        response.redirect("/login")
    } else{

        const query= `DELETE FROM guestbook_comments WHERE id = ?`;
        db.run(query, [id], function(error){
            if(error){
                console.log(error)
                response.render("error.hbs")
            } 
            else{
                response. redirect("/guestBook")
            }
        })
    }
})

app.listen(80)