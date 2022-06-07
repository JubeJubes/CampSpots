const Campground = require ('../models/campground')
const {cloudinary} = require('../cloudinary')
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding')
const mapBoxToken = process.env.MAPBOX_TOKEN
const geocoder = mbxGeocoding({accessToken:mapBoxToken})

module.exports.index = async (req,res)=> {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index',{campgrounds})
}

module.exports.renderNewForm = (req,res)=> {
    res.render('campgrounds/new')
}

module.exports.submitNewForm = async (req,res,next)=> {
   const geoData =await geocoder.forwardGeocode({
       query:req.body.ground.location,
       limit:1
       }).send()
   console.log (geoData.body.features[0].center)
    res.send(geoData.body.features[0].center)


    const grnd = new Campground(req.body.ground)
    grnd.geometry = geoData.body.features[0].geometry
    grnd.images = req.files.map(f=>({url:f.path,filename:f.filename}))
    grnd.author = req.user._id
    await grnd.save()
    //console.log(grnd)
    req.flash('success','Campground Added')
    res.redirect (`/campgrounds/${grnd._id}`)
     
}

module.exports.renderEditForm = async (req,res,next)=> {
    const {id} = req.params
    
    const grnd = await Campground.findById(id)
    if (!grnd) {
        req.flash('error','Why you give me trouble with stuff that dont exist?!?!?')
        return res.redirect('/campgrounds')
    }
    if(!grnd.author.equals(req.user._id)) {
        req.flash('error','Oh no smartypants. You are not this campground entry\'s owner')
        return res.redirect(`/campgrounds/${grnd._id}`)
    }

    res.render('campgrounds/edit', {grnd})
} 

module.exports.submitEditForm = async (req,res,next)=> {
    
    //  const geoData =await geocoder.forwardGeocode({
    //      query:req.body.ground.location,
    //      limit:1
    //  }).send()
    const {id} = req.params
    const grnd = await Campground.findByIdAndUpdate(id,{...req.body.ground},{runValidators:true,new: true})
    grnd.images.push(...(req.files.map(f=>({url:f.path,filename:f.filename}))))
   // grnd.geometry = geoData.body.features[0].geometry
    await grnd.save()
    if (req.body.deleteImages){
       for (let file of req.body.deleteImages) {
           await cloudinary.uploader.destroy(file)
       }
        await grnd.updateOne({$pull:{images:{filename:{$in:req.body.deleteImages}}}})
       
    }
    //console.log(grnd.pictures)

    req.flash('success','Campground Edited')
    res.redirect(`/campgrounds/${grnd._id}`)
}

module.exports.renderShowPage = async(req,res,next) =>{
    
    const grnd = await Campground.findById(req.params.id).populate({
        path:'reviews',
        populate: {
            path:'author'
        }
    }).populate('author')
   //console.log(grnd)
    if (!grnd) {
        req.flash('error','Why you give me trouble with stuff that dont exist?!?!?')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', {grnd})
 }

 module.exports.deleteOne =async(req,res,next)=> {
    const {id} = req.params
    await Campground.findByIdAndDelete(id)
    req.flash('success','Campground Deleted')
    res.redirect('/campgrounds/')
}