const mongoose = require('mongoose');

const boxSchema = new mongoose.Schema({
    name: { 
        type: String, 
        unique: true, 
        dropDups: true,
        required: true,
    }, 
    messageHash: { 
        type: String, 
        default: "", 
    },
});

const Box = mongoose.model('Box', boxSchema);

module.exports = Box;
