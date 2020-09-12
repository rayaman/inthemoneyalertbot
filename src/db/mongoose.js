const mongoose = require("mongoose")
//mongodb://localhost:27017/wagdatabase
//mongodb+srv://wag:weloveauctions2020@supercluster-hx6pa.mongodb.net/wagdatabase?retryWrites=true&w=majority
mongoose.connect("mongodb+srv://wag:weloveauctions2020@supercluster-hx6pa.mongodb.net/wagdatabase?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useCreateIndex: true
})