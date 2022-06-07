const mongoose = require('mongoose')
module.exports.dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
module.exports.mongConnect = async () => {
    try {
        await mongoose.connect(dbUrl)
        console.log("Connected to mongoDB")
    } catch (error) {
        handleError(error)
    }
}