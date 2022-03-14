require('dotenv').config();
const express = require("express");
const path = require("path");
const app = express();
const hbs = require("hbs");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");
const auth = require("./middleware/auth");
require("./db/conn");
const Register = require("./models/registers")

const port = process.env.PORT || 3000;

const static_path = path.join(__dirname, "../public" );
const template_path = path.join(__dirname, "../templates/views" );
const partials_path = path.join(__dirname, "../templates/partials" );


//console.log(path.join(__dirname, "../public"));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended:false}));



app.use(express.static(static_path))
app.set("view engine", "hbs");
app.set("views", template_path);
hbs.registerPartials(partials_path);



app.get("/", (req, res) =>{
res.render("index")
});

app.get("/register", (req, res) => {
    res.render("register")
})

app.get("/login", (req, res) => {
    res.render("login")
})

app.get("/secret",  auth  ,(req, res) => {
   // console.log(` this is the cookies awesome ${req.cookies.jwt}`);
     res.render("secret")
})

app.get("/logout", auth,  async(req, res) => {
    try {
        console.log(req.user)
        //for single logout 
        //req.user.tokens = req.user.tokens.filter((currElement) => {
          //  return currElement.token !== req.token
        //})

        //logout from all device

        req.user.tokens = [];
        res.clearCookie("jwt");
        console.log("logout successfully");
        await req.user.save();
        res.render("login");
    } catch (error) {
        res.status(500).send(error)
        
    }
})

app.post("/register", async(req, res) => {
    try {
        const password = req.body.password;
        const cpassword = req.body.confirmpassword;
        if(password === cpassword){
          const registerEmployee = new Register({
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email,
            password: password,
            confirmpassword: cpassword,
            number: req.body.number,
            gender: req.body.gender
        })
        // generating token for register

        console.log("the success part" + registerEmployee);

        const token = await registerEmployee.generateAuthToken();
        console.log("the token part" + token);
        //the res.cookie() function is used to set the cookies name to value.
        //the value parameter may be a string or object converted to JSON.
        //syntax:
        //res.cookie(name, value ,[ option])


        res.cookie("jwt", token, {
            expires:new Date(Date.now() + 30000),
            httpOnly:true
        });
        console.log(cookie);

        const registered = await registerEmployee.save();
        console.log("the page part" + registered);
        //generating token for register ******

        res.status(201).render("index");
        }else{
            res.send("Password is not matched")
        }
    } catch (error) {
        res.status(400).send(error);
        console.log("the error part page");
    }
})
// login check
app.post("/login", async(req, res) => {
    try {
       const email = req.body.email;
       const password = req.body.password;
        const useremail = await Register.findOne({email:email});
       // return back password to hash password during login
        const isMatch =  await bcrypt.compare(password, useremail.password) 
  //generating token for login
        const token = await useremail.generateAuthToken();
        console.log("the token part" + token);

        res.cookie("jwt", token, {
            expires:new Date(Date.now() + 600000),
            httpOnly:true
         });
         



        if(isMatch){ //(useremail.password === password){
            res.status(201).render("index");
        }else{
            res.send("Invalid Login Details")
        }
       // res.send(useremail);
        //console.log(useremail);
      // console.log(`${email} and password is ${password}`) 
    } catch (error) {
        res.status(400).send("Invalid Login Details")
        
    }
})

app.listen(port, () =>{
    console.log(`server is running at port no ${port}`);
})