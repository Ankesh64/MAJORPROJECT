
if(process.env.NODE_ENV != "production") {      //to access .env file for development phase only not in production phase for privacy.
    require('dotenv').config();
};


const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodoverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require('connect-mongo').default;
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");


const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

const dbUrl = process.env.ATLASDB_URL;      //connecting to cloud atlas db


main()
 .then(() => {
    console.log("connected to db");
 })
 .catch((err) =>{
    console.log(err);
 }); 

async function main() {
await mongoose.connect(dbUrl);        //writing function for db
};

app.set("view engine", "ejs");         //setting path for views
app.set("views", path.join(__dirname,"views"));
app.use(express.urlencoded({extended: true}));   //to pass all the that comes in req of show route
app.use(methodoverride("_method"));
app.engine('ejs', ejsMate); 
app.use(express.static(path.join(__dirname, "/public")));

//using mongo store to store session in db instead of memory
const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 60 * 60,        //in seconds
});

store.on("error", ()=>{
    console.log("ERROR in MONGO SESSION STORE", err)
})

const sessionOptions = {
    store,
    secret: "mysupersecretcode",
    resave: false,
    saveUninitialized: true,
    cookie:{
        expires: Date.now() + 7 * 25 * 60 * 1000,   //converting 1 week in milisecond
        maxAge: 7 * 25 * 60 * 1000,
        httpOnly: true,
    },
};

// app.get("/", (req, res) =>{
//     res.send("hi, i am root");
// });

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());                 //it also uses the session, as if one session is created it won't ask user,pass again and again 
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));       //it is saying that LocalStrategy which is created under passport.all the user should be authenticated through localstrategy and the method used in this will be authenticate().

passport.serializeUser(User.serializeUser());       //taken from website(npm-plm)  //storing all the info releated to user inside the session is serialize
passport.deserializeUser(User.deserializeUser());           //and unstoring all the info releated to user inside the session is deserialize

app.use((req, res, next) =>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});
 
// app.get("/demouser", async (req, res) => {
//     let fakeUser = new User({
//         email: "student@gmail.com",
//         username: "delta-student"
//     });
    
//     let registeredUser = await User.register(fakeUser, "helloworld");          //register method automatically checks if the username is unique or not we don't have to check it in db or writting code for it
//     res.send(registeredUser);
// });

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/", userRouter);

// app.get("/testListing", async (req, res) =>{
//     let sampleListing = new Listing({
//         title:"My New villa",
//         description: "By the beach",
//         price: 1200,
//         location: "singapore, Goa",
//         country: "India",
//     });

//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("sucessful testing");
// });

app.all("*", (req, res, next) =>{                           //for any route wheather it matches the upper route or not.if it matches then already sent msg if not this will execute
    next(new ExpressError(404, "page not found"));
});                      
     

app.use((err,req,res, next)=>{
    let {statusCode = 500, message = "Something went wrong!"} = err;
    // res.status(statusCode).send(message);
    res.status(statusCode).render("error.ejs", {message});
});

app.listen(8080, () =>{
console.log("server is listening to port 8080");
});