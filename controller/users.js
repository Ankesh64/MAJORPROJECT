const User = require("../models/user");

module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup");
};

module.exports.signup = async(req, res) =>{
    try {                                           //without using try,catch when we got an error like user already registered..we were redirecting to an lost page.so, we used try,catch
        let {username, email, password} = req.body;   //extracting username, pass,email
        const newUser = new User({ email,username });
        const registeredUser = await User.register(newUser, password);
        console.log(registeredUser);
        req.login(registeredUser, (err) => {
            if(err) {
                return next(err);
            }
            req.flash("success", "Welcome to Wanderlust!");
            res.redirect("/listings");
        });
    } catch(e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
    
};

module.exports.renderLoginForm = (req, res) =>{
    res.render("users/login.ejs");
};

module.exports.login = async (req,res) =>{
    req.flash("success", "Welcome back to Wanderlust!");
    let redirectUrl = res.locals.redirectUrl || "/listings";       // || listings bcz if we try to direct login we will redirect to listings   //redirectUrl is the url from where user is sent to login page
    res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
    req.logout((err) => {               //if any error occurs during logout.error will be stored in (err)
        if(err) {
            return next(err);
        }
        req.flash("success", "you are logged out!");
        res.redirect("/listings");
    });
};