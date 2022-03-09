
const mongoose= require('mongoose');
const afficheSchema = new mongoose.Schema({
    listeId:{
        type:String,
        required:true,
        min:3
    },
    risqueTotal:{
    type:String,
        required:true,
        min:3
    }, 
       userId:{
        type:String,
        required:true,
        min:3
    },
    createdAt:{
        type:Date,
        default:Date.now
    }});

    module.exports=mongoose.model('AfficheKYC',afficheSchema);