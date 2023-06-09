const http = require("http");
const EventEmitter = require("events");

const { records, eventStreamHead } = require("./constants");

const { getBody, handleResponse, handleConnection } = require("./helpers/http");
const { getFormattedDate, getFormattedTime } = require("./helpers/format");
const { isUniqueRecord, removeRecord } = require("./helpers/record");
const { validateBody } = require("./helpers/validation");

const PORT = 3000;

const connectionEmitter = new EventEmitter();
connectionEmitter.on("handleConnection", handleConnection);

http
  .createServer(async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");

    if (req.url === "/api/doctor-appointment" && req.method === "POST") {
      const body = await getBody(req);
      const errors = validateBody(body);

      if (errors) {
        res.writeHead(400);
        res.write(errors);
        res.end();

        return;
      }

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

      const reminderEmitter = new EventEmitter();

      reminderEmitter.once("day", handleResponse(res));
      reminderEmitter.once("hour", handleResponse(res));

      res.writeHead(200, eventStreamHead);
      res.write("data: Record created\n\n");

      const intervalId = setInterval(() => {
        const currentDate = new Date();
        const currentDay = currentDate.getDate();

        if (date.getDate() - currentDay <= 1) {
          reminderEmitter.emit("day", record);
        }

        if (date - currentDate <= 5_400_000) {
          reminderEmitter.emit("hour", record);

          clearInterval(intervalId);

          res.end();
          return;
        }

        connectionEmitter.emit("handleConnection", res);
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
