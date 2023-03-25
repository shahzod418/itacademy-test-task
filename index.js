const http = require("http");
const EventEmitter = require("events");

const records = require("./constants");

const { getBody, handleResponse } = require("./helpers/http");
const { getFormattedDate, getFormattedTime } = require("./helpers/format");
const { isUniqueRecord, removeRecord } = require("./helpers/record");

const PORT = 3000;

http
  .createServer(async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");

    if (req.url === "/api/doctor-appointment" && req.method === "POST") {
      const body = await getBody(req);

      const { doctor, address } = body;
      const date = new Date(body.date);

      const record = {
        doctor,
        date: getFormattedDate(date),
        time: getFormattedTime(date),
        address,
      };

      if (!isUniqueRecord(record)) {
        res.writeHead(400);
        res.write(`There is already an appointment for ${doctor} at ${date}`);
        res.end();

        return;
      }

      records.push(JSON.stringify(record));

      const eventEmitter = new EventEmitter();

      eventEmitter.once("day", handleResponse(res));
      eventEmitter.once("hour", handleResponse(res));

      res.writeHead(200, {
        Connection: "keep-alive",
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
      });

      const intervalId = setInterval(() => {
        const currentDate = new Date();
        const currentDay = currentDate.getDate();
        const currentHour = currentDate.getHours();
        const currentMinute = currentDate.getMinutes();

        const checkRoundDate =
          date.getHours() - currentHour === 1 &&
          Math.abs(date.getMinutes() - currentMinute) <= 30;

        const checkHalfDate =
          date.getHours() - currentHour === 2 &&
          Math.abs(date.getMinutes() - currentMinute) >= 30;

        if (date.getDate() - currentDay <= 1) {
          eventEmitter.emit("day", record);

          if (checkRoundDate || checkHalfDate) {
            eventEmitter.emit("hour", record);

            clearInterval(intervalId);

            res.end();
            return;
          }
        }
      }, 60000);

      req.socket.on("close", () => {
        clearInterval(intervalId);
        removeRecord(record);
      });
    } else {
      res.writeHead(404);
      res.end();
    }
  })
  .listen(PORT, () => {
    console.log(`Server started on port: ${PORT}`);
  });
