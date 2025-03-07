const validateProductCreation = (req, res, next) => {
    const requiredFields = [
      "name",
      "description",
      "price",
      "category",
      "brand",
      "stock"
    ];
  
    for (let field of requiredFields) {
      const keys = field.split('.');
      let value = req.body;
      
      for (let key of keys) {
        if (!value || !(key in value)) {
          return res.status(400).json({ error: `Missing required field: ${field}` });
        }
        value = value[key];
      }
    }
  
    next();
  };
module.exports={validateProductCreation};