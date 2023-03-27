const validFields = ["doctor", "date", "address"];

const validateBody = (body) => {
  let errors = "";

  validFields.forEach((field) => {
    if (!body[field]) {
      errors += `${field} is required\n`;
    }
  });

  return errors;
};

module.exports = {
  validateBody,
};
