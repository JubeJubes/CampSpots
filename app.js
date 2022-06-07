if (process.env.NODE_ENV !== "production") {
    require('dotenv').config()
}


const express = require ('express')
const app = express()

//Node,Express utilities,Mongo Session store
const path = require ('path')
const mongoose = require('mongoose')
const ejsMate = require('ejs-mate')
const methodOverride = require('method-override')
const flash = require('connect-flash')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const session = require('express-session')
const MongoStore = require('connect-mongo');


//Application Utilities
/* Schemas */
const {campgroundSchema,reviewSchema} = require('./schemas')
const Campground = require ('./models/campground')
const Review = require ('./models/reviews')
const User = require ('./models/user')

/* Routes  */
const userRoutes = require('./routes/users')
const campgroundRoutes = require('./routes/campgrounds')
const reviewRoutes = require('./routes/reviews')

/* Errors,Validation, Mongo */
const catchAsync = require('./utils/catchAsync')
const ExpressError  = require('./utils/ExpressError')
const {mongConnect, dbUrl} = require('./mongConnect')
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require ('helmet');

//MongoDB Connect
mongConnect()
mongoose.connection.on('error', err => {
    logError(err);
});

//Express Utilities
app.engine('ejs',ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({extended:true}))
app.use(express.json())
app.use(methodOverride('_method'))
app.use(mongoSanitize());
 
const secret = process.env.SECRET || 'CousCousETLouLou'

const store = MongoStore.create ({
    mongoUrl: dbUrl,
    touchAfter: 24*3600,
    crypto : {
        secret,
    }
})

store.on("error", function(e) {
    console.log("Session Store Error", e)
})
const sessionConfig = { 
    
    name:'YelpCampers',
    secret,
    resave:false,
    saveUninitialized:true,
    cookie:{
        httpOnly: true,
        //secure:true,
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000
    },
    store,
    
}
app.use(session(sessionConfig));
app.use(flash());
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
    
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",

];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dc2lqicn8/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
                "https://get.pxhere.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.currentUser = req.user
    //console.log(req.query)
    res.locals.success = req.flash('success') //: req.flash('success',NULL) 
    res.locals.error = req.flash('error') //:req.flash('error',NULL) 
    next()
})



//*** "/campgrounds Router" */
app.use('/',userRoutes)
app.use('/campgrounds',campgroundRoutes)
app.use('/campgrounds/:id/reviews',reviewRoutes)


//root
app.get('/',(req,res)=> {
    res.render('home')
})

app.all("*", (req,res,next)=> {
    next (new ExpressError("Page not Found", 404))
})

app.use((err,req,res,next)=> {
    //const {message = "Something went Wrong",statusCode = 500} = err
    const {statusCode =500} = err
    if(!err.message) err.message = "Oh Noes, Something terrible has happened Doc"
    res.status(statusCode).render("error", {err})
})

app.listen(3000, ()=> {
    console.log("Serving on Port 3000",Date())
})