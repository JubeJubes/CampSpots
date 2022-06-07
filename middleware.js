const ExpressError  = require('./utils/ExpressError')
const Campground = require ('./models/campground')
const Review = require ('./models/reviews')
const {campgroundSchema,reviewSchema} = require('./schemas')


module.exports.isLoggedIn = (req,res,next)=>{
    const {id} = req.params
    if(!req.isAuthenticated()){
        
        req.session.returnTo = (req.query._method === 'DELETE')?  `campgrounds/${id}` : req.originalUrl
        req.flash('error','You must be signed in')
        return res.redirect('/login') 
    }
    next()
}

// JOI validation
module.exports.validateCampground = (req,res,next) => {
    const {error} = campgroundSchema.validate(req.body)
    if(error) {
        const msg = error.details.map(el=>el.message).join(',')
        throw new ExpressError (msg, 400)
    }
    else next()
}

module.exports.isAuthor = async(req,res,next)=>{
    const {id} = req.params
    const grnd = await Campground.findById(id)
    if(!grnd.author.equals(req.user._id)) {
        req.flash('error','Oh no smartypants. You are not this campground entry\'s owner')
        return res.redirect(`/campgrounds/${grnd._id}`)
    }
    next()
}
module.exports.validateReview = (req,res,next) => {
    /*Joi Schema, not mongoose schema*/
    
    const {error} = reviewSchema.validate(req.body)
    if(error) {
        const msg = error.details.map(el=>el.message).join(',')
        throw new ExpressError (msg, 400)
    }
    else next()
}

module.exports.isReviewer = async(req,res,next)=>{
    const {id,reviewId} = req.params
    const review = await Review.findById(reviewId)
    if(!review.author.equals(req.user._id)) {
        req.flash('error','Oh no smartypants. You did not write this review')
        return res.redirect(`/campgrounds/${id}`)
    }
    next()
}