const Joi = require("joi");

const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware",
  "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky",
  "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi",
  "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico",
  "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania",
  "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont",
  "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"
];



exports.propertySchema = Joi.object({
  title:       Joi.string().required(),
  description: Joi.string().required(),
  price:       Joi.number().required(),
  type:        Joi.string()
                   .valid("apartment","house","villa","building","store")
                   .required(),
  city:        Joi.string().required(),
  state:       Joi.string().valid(...US_STATES).required(),
  forSale:     Joi.boolean().required(),
  images:      Joi.array().items(Joi.string().uri())
});


exports.authRegisterSchema = Joi.object({
  username:    Joi.string().alphanum().min(3).max(30).required(),
  displayName: Joi.string().min(3).max(50).required(),
  email:       Joi.string().email().required(),
  password:    Joi.string().min(6).required()
});

exports.authLoginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required()
});


exports.commentSchema = Joi.object({
  content:    Joi.string().required(),
  propertyId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required()
});


exports.likeSchema     = Joi.object({ propertyId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required() });
exports.bookmarkSchema = Joi.object({ propertyId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required() });


exports.messageSchema = Joi.object({
  receiverId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  content:    Joi.string().required()
});

exports.changePassSchema = Joi.object({
  oldPassword:     Joi.string().required(),
  newPassword:     Joi.string().min(6).required(),
  confirmPassword: Joi.any().valid(Joi.ref('newPassword')).required()
    .messages({ 'any.only': 'confirmPassword must match newPassword' })
});
