const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
//const async = require("hbs/lib/async");
const employeeSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    confirmpassword: {
        type: String,
        required: true
    },
    number: {
        type: Number,
        required: true
    }, 
    gender: {
        type: String,
        required: true
    },
    tokens:[{
        token:{
            type: String,
            required: true
        }
    }]

})
//generating token for register
employeeSchema.methods.generateAuthToken = async function(){
    try {
        console.log(this._id);
        const token = jwt.sign({_id:this._id.toString()}, process.env.SECRET_KEY);
        this.tokens = this.tokens.concat({token:token})
        await this.save();
        //console.log(token);
        return token;
        
    } catch (error) {
        res.send("the error part" + error);
        console.log("the error part" + error);
        
    }

}

// hashing register password
employeeSchema.pre("save",  async function(next){
    if(this.isModified("password")){
      //  console.log(`the current password is ${this.password}`);
        this.password = await bcrypt.hash(this.password, 10);
       // console.log(`the current password is ${this.password}`);

        this.confirmpassword = await bcrypt.hash(this.password, 10);
    }
    next();
})

const Register = new mongoose.model("Register", employeeSchema);
module.exports = Register;