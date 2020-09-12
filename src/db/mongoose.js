const mongoose = require("mongoose")
//mongodb://localhost:27017/wagdatabase
//mongodb+srv://wag:weloveauctions2020@supercluster-hx6pa.mongodb.net/wagdatabase?retryWrites=true&w=majority
const pass = process.env.PASS
const user = process.env.USER
mongoose.connect("mongodb+srv://"+user+":"+pass+"@supercluster-hx6pa.mongodb.net/itmdatabase?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useCreateIndex: true
})
