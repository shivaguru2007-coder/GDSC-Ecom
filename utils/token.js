const jwt = require("jsonwebtoken");

const generateToken = (sellerId) => {
  return jwt.sign({ _id: sellerId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};
//console.log(generateToken(22323))
module.exports = generateToken;
