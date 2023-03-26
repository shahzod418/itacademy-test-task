const http = require("http");
const EventEmitter = require("events");

const { records, eventStreamHead } = require("./constants");

const { getBody, handleResponse, checkTimeEvent } = require("./helpers/http");
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

      if (date < Date.now()) {
        res.writeHead(400);
        res.write("Can't assign an appointment in the past");
        res.end();

        return;
      }

      if (!isUniqueRecord(record)) {
        res.writeHead(400);
        res.write(
          `Appointment for ${doctor} at ${record.date} ${record.time} already exists`
        );
        res.end();

        return;
      }

      records.push(JSON.stringify(record));

      const eventEmitter = new EventEmitter();

      eventEmitter.once("dayReminder", handleResponse(res));
      eventEmitter.once("hourReminder", handleResponse(res));
      eventEmitter.on("checkTime", checkTimeEvent(res));

      res.writeHead(200, eventStreamHead);
      res.write("data: Record created\n\n");

      let index = 1;

      const intervalId = setInterval(() => {
        const currentDate = new Date();
        const currentDay = currentDate.getDate();

        if (date.getDate() - currentDay <= 1) {
          eventEmitter.emit("dayReminder", index, record);
        }

        if (date - currentDate <= 5_400_000) {
          eventEmitter.emit("hourReminder", index, record);

          clearInterval(intervalId);

          res.end();
          return;
        }

        eventEmitter.emit("checkTime", index);

        index += 1;
      }, 5000);

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
