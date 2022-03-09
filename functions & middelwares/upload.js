const fs = require("fs");
const sendFile = async (file, filePath) => {
if (file === undefined)
{return res.send("you have to select a file !");}
else
{
    if (!(fs.existsSync(filePath))) {
fs.mkdirSync(filePath);
}else{  
    
    uploads(file, filePath+`/${Date.now()}${file.originalname}`);
}
}
}
const uploads = async (file, path) => {
try{
var  writer=fs.createWriteStream(path);
writer.write(file.buffer);
}catch(error){
console.log("cannot send !")
console.log(error)
return error;
}
}
module.exports =sendFile;
