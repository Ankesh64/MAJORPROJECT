//this is for server side validation...eg:hoppscotch

const Joi = require('joi');

module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title:Joi.string().required(),
        description: Joi.string().required(),
        location: Joi.string().required(),
        country: Joi.string().required(),
        price: Joi.number().required().min(0),    //minimum value of price can be 0
        image: Joi.object({
            filename: Joi.string().allow("", null),     //image is allowed to be empty or null
            url: Joi.string().uri().allow("",null)      //.uri() : Ensures that if a url is provided, it's valid.
        }).optional()       //so you can leave it empty and prevents joi from throwing errors when image isn't included   
    }).required(),
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        comment: Joi.string().required(),
    }).required(),
});