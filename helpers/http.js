const getBody = (req) =>
  new Promise((resolve) => {
    const body = [];

    req
      .on("data", (chunk) => body.push(chunk.toString()))
      .on("end", () => {
        resolve(JSON.parse(body.join()));
      });
  });

const handleResponse = (res) => (data) => {
  res.write(`event: doctorAppointment\ndata: ${JSON.stringify(data)}\n\n`);
};

const handleConnection = (res) => {
  res.write("");
};

module.exports = {
  getBody,
  handleResponse,
  handleConnection,
};
