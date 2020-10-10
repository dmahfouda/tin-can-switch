const mongoose = require('mongoose');

const boxSchema = new mongoose.Schema({
    name: { 
        type: String, 
        unique: true, 
        dropDups: true,
        required: true,
    }, 
    full: { 
        type: Boolean, 
        default: false, 
    },
});

const Box = mongoose.model('Box', boxSchema);

module.exports = Box;
