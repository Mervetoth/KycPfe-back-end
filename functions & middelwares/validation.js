//validation
const joi = require("@hapi/joi");
//register validation
const registerValidationAdmin = (data) => {
  const schema = {
    firstName: joi.string().min(3).required(),
    lastName: joi.string().min(3).required(),
    email: joi.string().min(6).required().email(),
    telNumber: joi.string().length(8).required(),
    permissions: joi.array().min(1).required(),
    password: joi.string().min(6).required(),
  };
  return joi.validate(data, schema);
};
const registerValidationUser = (data) => {
  const schema = {
    firstName: joi.string().min(3).required(),
    lastName: joi.string().min(3).required(),
    telNumber: joi.string().length(8).required(),
    email: joi.string().min(6).required().email(),
    prod_id: joi.string().required(),
    pays_id: joi.string().required(), 
    birthDate:joi.date().required(),
    adresse: joi.string().min(8).required(),
    cin: joi.string().min(8).required(),
    password: joi.string().min(6).required(),
    permissions: joi.string().min(4).required(),
  };
  return joi.validate(data, schema);
};
const loginValidation = (data) => {
  const schema = {
    email: joi.string().min(6).required().email(),
    password: joi.string().min(6).required(),
  };
  return joi.validate(data, schema);
};

const ajouterProduitValidation = (data) => {
  const schema = {
    risqueProd: joi.number().required(),
    prodName: joi.string().required(),
  };
  return joi.validate(data, schema);
};

const ajouterRechercheValidation = (data) => {
  const schema = {
    typeRech: joi.string().required(),
    cin: joi.string().required(),
    status: joi.string().required(),
    listeId: joi.string().required(),
    historiqueRech: joi.string().required(),
    listeCorr: joi.string().required(),
  };
  return joi.validate(data, schema);
};


const ajouterNotifValidation = (data) => {
  const schema = {
    title: joi.string().required(),
    description: joi.string().required(),
  };
  return joi.validate(data, schema);
};


module.exports.ajouterNotifValidation= ajouterNotifValidation;
module.exports.registerValidationAdmin = registerValidationAdmin;
module.exports.registerValidationUser = registerValidationUser;
module.exports.ajouterProduitValidation = ajouterProduitValidation;
module.exports.ajouterRechercheValidation = ajouterRechercheValidation;
module.exports.loginValidation = loginValidation;
