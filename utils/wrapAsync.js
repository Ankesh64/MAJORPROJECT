module.exports= (fn) =>{                  //create wrapAsync function as well as exporting
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};