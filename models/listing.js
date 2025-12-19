
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new Schema({     //creating schema for db
    title:{
        type: String,
        required: true,
    },
    description: String,
    image: {
        filename:String,
        url:String,
    },
    price: Number,
    location: String,
    country: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review",
        },
    ],
    owner:{                             //adding owner
        type: Schema.Types.ObjectId,
        ref: "User",                     //its refering user bcz owner of listing must be a registered user
    },
    geometry: {
        type: {
            type: String, // Don't do `{ location: { type: String } }`
            enum: ['Point'], // 'location.type' must be 'Point'
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    }
});  

listingSchema.post("findOneAndDelete", async (listing) => {
    if(listing) {
        await Review.deleteMany({ _id: { $in: listing.reviews }});
    }
});

const Listing = mongoose.model("Listing", listingSchema);  //creating model
module.exports = Listing;

