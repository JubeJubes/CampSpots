const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp');

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];


const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 300; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20)+30;
        const camp = new Campground({
            author: "621466b2e69aca8ecd1d2181",
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            images: [
              {
                url: 'https://res.cloudinary.com/dc2lqicn8/image/upload/v1646007802/CampSpots/u7qokgtkj7nr0pptelat.jpg',
                filename: 'CampSpots/u7qokgtkj7nr0pptelat',
              },
              {
                url: 'https://res.cloudinary.com/dc2lqicn8/image/upload/v1646007860/CampSpots/gntmmzanr3csvhvsi50o.jpg',
                filename: 'CampSpots/gntmmzanr3csvhvsi50o',
              }
            ],
              
            description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempore excepturi, totam aliquam repellat laborum ratione veniam cumque? Veniam voluptatibus ut eius accusamus ipsum voluptates quis, quo molestiae eos. Velit, explicabo?",
            price,
            geometry :{
              type:"Point",
              coordinates: [
                cities[random1000].longitude,cities[random1000].latitude
              ]
            }
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})