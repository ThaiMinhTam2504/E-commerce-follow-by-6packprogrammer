const { error } = require("console");
const mongoose = require("mongoose");




const connectDatabase = () => {
    console.log("DB_URI from env:", process.env.DB_URI);

    mongoose.connect(process.env.DB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
        .then((data) => {
            console.log(`MongoDb connected with server: ${data.connection.host}`);
        })
        .catch((err) => {
            console.log(err)
        });
};



module.exports = connectDatabase;