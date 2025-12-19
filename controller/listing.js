const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });


module.exports.index = async (req, res) => {        //creating a route to index.ejs
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});
};

module.exports.renderNewForm = (req , res)=> {
    console.log(req.user);                                  //prints all the info releated to the user logged in. 
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) =>{
    let {id}= req.params;
    const listing = await Listing.findById(id)
    .populate({
        path: "reviews",        //to get all the reviews with each listing
        populate: {
            path: "author",         //and to get the author with each individual review
        },
        })
        .populate("owner");      //getting the info of user logged in,  to set the owner..like owned by that user.
    if(!listing) {
        req.flash("error", "Listing you requested for does not exist");
        res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show.ejs", {listing});
};

module.exports.createListing = async (req, res ,next) => {      //this will be a async function bcz we would in its db
        let response = await geocodingClient.forwardGeocode({       //setting forward geocoding for new listing created...
            query: req.body.listing.location,                       //getting location from listing for getting coordinates
            limit: 1,
            })
            .send();
            
    
        let url = req.file.path;
        let filename = req.file.filename;    
    // let (title, description, Image, price , Country, location) = req.body;
        const newListing = new Listing(req.body.listing);     //this is another way is which in new.ejs file we convert everything into key value pair with a object named listing 
        newListing.owner = req.user._id;            //bcz when a new listing is created by any user,it will show owned by that user instead of owner
        newListing.image = {url, filename};
        newListing.geometry = response.body.features[0].geometry;  //this velue is coming from mapbox and we are storing it in database.
        let savedListing = await newListing.save();
        console.log(savedListing);
        req.flash("success", "New Listing Created!");
        res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res)=>{
    let {id}= req.params;
    const listing = await Listing.findById(id);
    if(!listing) {
        req.flash("error", "Listing you requested for does not exist");
        res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_300,w_300");      //rendering image in lower size(small file),taken from cloudinary.
    res.render("listings/edit.ejs", {listing,originalImageUrl});
};

module.exports.updateListing = async (req, res) =>{
    let {id}= req.params;
    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing},{new:true});   //update all the data except file

    //update coordinate if location changed
    if(req.body.listing.location) {
        let response=await geocodingClient.forwardGeocode({query:req.body.listing.location,limit: 1,}).send();
        listing.geometry= response.body.features[0].geometry;
    }
    
    //update image if a new one is uploaded
    if(req.file) {
        listing.image={url:req.file.path,filename: req.file.filename,};
    }

    // if(typeof req.file !=="undefined") {                    //checking if the file in req exist or not(in case if someone didn't uploaded any file then further process won't happen)
    //     let url = req.file.path;                            //to check if any veriable is defined or not js has typeof operator
    //     let filename = req.file.filename;
    //     listing.image = { url, filename};                  //update the listing variable with file along with other data
        await listing.save();                              //to update url and filename again we will save
    // }  
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async(req, res) =>{
    let {id}= req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
};