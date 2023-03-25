const getFormattedValue = (value) => {
  if (String(value).length === 1) {
    return `0${value}`;
  }

  return value;
};

const getFormattedDate = (date) => {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return `${getFormattedValue(day)}:${getFormattedValue(month)}:${year}`;
};

const getFormattedTime = (date) => {
  const hour = date.getHours();
  const minute = date.getMinutes();

  return `${getFormattedValue(hour)}:${getFormattedValue(minute)}`;
};

module.exports = {
  getFormattedDate,
  getFormattedTime,
};
