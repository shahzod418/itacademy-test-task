const getBody = (req) =>
  new Promise((resolve) => {
    const body = [];

    req
      .on("data", (chunk) => body.push(chunk.toString()))
      .on("end", () => {
        resolve(JSON.parse(body.join()));
      });
  });

const handleResponse = (res) => (index, data) => {
  res.write(
    `event: doctorAppointment\nid: ${index}\nretry: 5000\ndata: ${JSON.stringify(
      data
    )}\n\n`
  );
};

const checkTimeEvent = (res) => (index) => {
  res.write(`event: checkTime\nid: ${index}\nretry: 5000\ndata:\n\n`);
};

module.exports = {
  getBody,
  handleResponse,
  checkTimeEvent,
};
