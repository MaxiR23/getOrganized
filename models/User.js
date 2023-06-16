import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    token: {
        type: String
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true
});
//se ejecutará antes de guardar el registro en la db
userSchema.pre('save', async function(next) {
    if(!this.isModified('password')){ //Si  no esta modificando el password entonces que no haga nada.
        next();
    }
    const salt = await bcrypt.genSalt(10); /* crea hash */
    this.password = await bcrypt.hash(this.password, salt)
})

userSchema.methods.checkpassword = async function (passwordform) {
    return await bcrypt.compare(passwordform, this.password)
}

const User = mongoose.model('User', userSchema)
export default User;