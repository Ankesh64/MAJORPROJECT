const Listing = require("./models/listing");
const Review = require("./models/review");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema , reviewSchema} = require("./schema.js");

module.exports.isLoggedIn = (req, res, next) => {
        if(!req.isAuthenticated()) {                            //passport method to check if the user is logged in or if user is authenticated or not.
            //redirect url save. redirect url is the url from where user is sent to login page
            req.session.redirectUrl = req.originalUrl;
            req.flash("error", "you must be logged in to create listing!");
        return res.redirect("/login");
    }
    next();
};

module.exports.saveRedirectUrl = (req, res, next) =>{      //we need to use local bcz of passport bcz in passport when we got login ,passport resets the session or deletes the url
    if(req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

module.exports.isOwner= async (req, res, next)=> {          //for authorisation 
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner._id.equals(res.locals.currUser._id)) {
        req.flash("error", "You don't have permission to edit");
         return res.redirect(`/listings/${id}`);        //using return to stop further process(the change)
    }
    next();
};

module.exports.validateListing = (req,res,next) =>{
    let {error} = listingSchema.validate(req.body);
    if(error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, error);
    } else{
        next();
    }
};

module.exports.validateReview = (req,res,next) =>{
    let {error} = reviewSchema.validate(req.body);
    if(error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, error);
    } else{
        next();
    }
};

module.exports.isReviewAuthor= async (req, res, next)=> {          //for authorization of user to delete any review as if he is author of that review which he wanted to delete or not 
    let { id , reviewId} = req.params;          //extracting id,reviewId from req.params
    let review = await Review.findById(reviewId);
    if(!review.author.equals(res.locals.currUser._id)) {
        req.flash("error", "You are not the author of this review");
         return res.redirect(`/listings/${id}`);        //using return to stop further process(deletion)
    }
    next();
};