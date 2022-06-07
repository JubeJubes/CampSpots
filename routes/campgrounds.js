const express = require('express')
const router = express.Router()
const catchAsync = require('../utils/catchAsync')
const Campground = require ('../models/campground')
const {isLoggedIn,isAuthor,validateCampground} = require ('../middleware')
const campgrounds = require('../controllers/campgrounds')
const multer  = require('multer')
const {storage} = require('../cloudinary')
const upload = multer({storage})

router.route('/')
  .get (catchAsync (campgrounds.index))
  .post(isLoggedIn,upload.array('image'),validateCampground,catchAsync(campgrounds.submitNewForm))


router.get('/new',isLoggedIn, campgrounds.renderNewForm )

router.route('/:id')
  .get ( catchAsync (campgrounds.renderShowPage))
  .put(isLoggedIn, isAuthor,upload.array('image'), validateCampground, catchAsync (campgrounds.submitEditForm))
  .delete ( isLoggedIn, isAuthor,catchAsync (campgrounds.deleteOne))

router.get('/:id/edit',isLoggedIn,isAuthor, catchAsync (campgrounds.renderEditForm))

module.exports = router