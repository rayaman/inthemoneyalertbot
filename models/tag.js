const mongoose = require("mongoose")

const tagSchema = new mongoose.Schema({
    tag: {
        type: String,
        required: true,
    },
    userid: {
        type: Number,
        required: true,
    },
})
tagSchema.statics.tagExists = function (id, tag, callback, alreadyHave, noHave, a, a2) {
    this.findOne({ tag: tag, userid: id }, function (err, t) {
        callback(t !== null, tag, t, alreadyHave, noHave, a == a2)
    })
}
tagSchema.statics.removeTags = async function (id, callback) {
    records = await this.find({ userid: id });
    this.deleteMany({ userid: id }, function () { })
    var rec = []
    for (var r in records) {
        rec.push(records[r].tag)
    }
    callback(rec)
}
tagSchema.statics.getTags = async function (id, callback) {
    records = await this.find({ userid: id });
    var rec = []
    for (var r in records) {
        rec.push(records[r].tag)
    }
    callback(rec)
}
tagSchema.statics.addTag = function (id, t) {
    var tag = new Tag({
        tag: t,
        userid: id
    })
    tag.save()
}
tagSchema.statics.removeTag = function (id, tag, callback) {
    this.findOneAndDelete({ tag: tag, userid: id }, function (err) { })
}
const Tag = mongoose.model('tags', tagSchema)
module.exports = Tag