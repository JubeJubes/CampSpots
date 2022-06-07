const mongoose = require('mongoose')
const Review = require('./reviews')
const Schema = mongoose.Schema


const ImageSchema = new Schema ({
    url: String,
    filename: String
})

ImageSchema.virtual('thumbnail').get(function(){
    return this.url.replace('/upload','/upload/c_fill,h_200,w_300')
})

const opts = {toJSON: {virtuals:true}}

const CampgroundSchema = new Schema ( {
    title: String,
    images: [ImageSchema],
    geometry: {
        type: {
            type:String,
            enum:['Point'],
            required:true
        },
        coordinates: {
            type:[Number],
            required:true
        },
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: "User" 
    },
    reviews : [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }     
    ]
},opts)

CampgroundSchema.virtual('properties.popUpBox').get(function(){
    return `<strong><a href="/campgrounds/${this._id}"><h6>${this.title}</h6></a></strong>
            <p>${this.description.substring(0,30)}...</p>`
})

CampgroundSchema.post('findOneAndDelete', async function(doc) {
    await Review.deleteMany ( {
        _id: {
            $in:doc.reviews
        }
    })
})

module.exports = mongoose.model('Campground', CampgroundSchema)




//https://res.cloudinary.com/dc2lqicn8/image/upload/w_400/v1645930672/CampSpots/tr5zvvexsz9201ll3u00.jpg