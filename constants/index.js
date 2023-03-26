const records = [];

const eventStreamHead = {
  Connection: "keep-alive",
  "Content-Type": "text/event-stream",
  "Cache-Control": "no-cache",
};

module.exports = { records, eventStreamHead };
