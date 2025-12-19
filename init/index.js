const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
 .then(() => {
    console.log("connected to db");
 })
 .catch((err) =>{
    console.log(err);
 }); 

async function main() {
 await mongoose.connect(MONGO_URL);        //writing function for db
}

// const initDB = async () => {
//     await Listing.deleteMany({});
//     initData.data = initData.data.map((obj) =>({    //applying map func. inside initData which which will add new property(owner) inside each individual listing object of data.js(init)
//         ...obj,                                     //map function creates new object with insertion of new property..
//         owner: "6943f5d3bb316f9401d988b4" ,
//     })); 
//     try {
//         const result = await Listing.insertMany(initData.data);
//         console.log(`Inserted ${result.length} listings`);
//     } catch (err) {
//         console.log("Error inserting listings:", err);
//     }
// }; 

const initDB = async ()=> {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) =>({    //applying map func. inside initData which which will add new property(owner) inside each individual listing object of data.js(init)
            ...obj,                                     //map function creates new object with insertion of new property..
            owner: mongoose.Types.ObjectId("6943f5d3bb316f9401d988b4") ,
            geometry: {
            type: "Point",
            coordinates: [0, 0] // default coordinates
        }

    })); 
    await Listing.insertMany(initData.data);
    console.log("data was initialized");
};

// initDB();
