require('dotenv').config();
const express = require('express');
const ejs = require('ejs');
const app = express();
const mongoose = require("mongoose");
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

app.use(express.urlencoded({ extented: true }));
app.use(express.json());

app.set("view engine", "ejs");
app.use(express.static("public"));

// require the Twilio module and create a REST client
const client = require('twilio')(accountSid, authToken);


// mongoose database connection
const connectDB = async() => {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");
};
connectDB();


const userSchema = new mongoose.Schema({
    users: Number,
});

const OTP = mongoose.model("OTP", userSchema);


// home route
app.get("/", function(req, res) {
    res.render("home")
})

// verification route
app.get("/verify", function(req, res) {
    res.render("verify")
})

app.post("/verify", function(req, res) {
    const code = req.body.code

    OTP.findOne({ users: code }, function(err, found) {
        if (err) {
            res.render("error")
        } else if (found) {
            res.render("success")
        } else {
            res.render("error")
        }
    })
})





// post request to phone number
app.post("/", function(req, res) {

    const number = req.body.number
        // random number
    let randomN = Math.floor(Math.random() * 90000) + 10000;

    // sends random number to user number then redirects the the /verify route
    client.messages
        .create({
            to: number,
            from: '+12404883583',
            body: randomN,
        }).then(saveUser())

    function saveUser() {
        const newUser = new OTP({
            users: randomN
        })
        newUser.save(function(err) {
            if (err) {
                console.log("error generating numb")
            } else {
                res.render("verify")
            }
        })
    }


})




let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}

app.listen(port, function() {
    console.log('app started successfully')
});