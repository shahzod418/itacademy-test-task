const records = require("../constants");

const isUniqueRecord = (data) => {
  const draftData = JSON.stringify(data);

  return !records.find((record) => draftData === record);
};

const removeRecord = (data) => {
  const draftData = JSON.stringify(data);

  const index = records.findIndex((record) => draftData === record);

  records.splice(index, 1);
};

module.exports = {
  isUniqueRecord,
  removeRecord,
};
