const mongoose = require("mongoose")
const Tag = require("./tag")

const userSchema = new mongoose.Schema({
    name: {
        type: Number,
        required: true,
        trim: true
    },
    tags: [{
        tag: {
            type: String,
            required: false
        }
    }],
})

userSchema.statics.addTag = (user,tags) => {
    var tag = new Tag({
        tag: "AMD"
    })
}
userSchema.statics.removeTag = (tags) => {
    const user = this
    for(var t in tags){
        array.splice(user.tags.indexOf(t), 1);
    }
    user.save()
}

const User = mongoose.model('users', userSchema)
module.exports = User