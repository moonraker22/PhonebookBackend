const express = require("express");
const morgan = require("morgan");
const path = require("path");
const fs = require("fs");
const { log } = require("console");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

let phonebook = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

const logger = morgan((tokens, req, res) => {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, "content-length"),
    "-",
    tokens["response-time"](req, res),
    "ms",
    "\n",
    `Body: ${JSON.stringify(req.body)}`,
  ].join(" ");
});
app.use(logger);

// Get the phonebook
app.get("/api/persons", (request, response) => {
  fs.readFile(path.join("./db.json"), (err, data) => {
    if (err) {
      throw err;
    }
    const phonebookData = JSON.parse(data);
    response.json(phonebookData);
  });
});

// Get phonebook info
app.get("/info", (request, response) => {
  fs.readFile(path.join("./db.json"), (err, data) => {
    if (err) {
      throw err;
    }
    const phonebookData = JSON.parse(data);
    const phonebookInfo = `Phonebook has info for ${phonebookData.length} people`;
    const time = new Date().toLocaleString();
    log(time);
    response.send(`<p>${phonebookInfo}</p><p>${time}</p>`);
  });
});

// Get a single person
app.get("/api/persons/:id", (request, response) => {
  fs.readFile(path.join("./db.json"), (err, data) => {
    if (err) {
      throw err;
    }
    const phonebookData = JSON.parse(data);
    const id = Number(request.params.id);
    const person = phonebookData.find((person) => person.id === id);
    if (person) {
      response.json(person);
    } else {
      response.status(404).send({ message: "Person not found" });
    }
  });
});

// Delete a single person
app.delete("/api/persons/:id", (request, response) => {
  fs.readFile(path.join("./db.json"), (err, data) => {
    if (err) {
      throw err;
    }
    const phonebookData = JSON.parse(data);
    const id = Number(request.params.id);
    const person = phonebookData.find((person) => person.id === id);
    if (person) {
      phonebookData.splice(phonebookData.indexOf(person), 1);
      fs.writeFile(
        path.join("./db.json"),
        JSON.stringify(phonebookData),
        (err) => {
          if (err) {
            throw err;
          }
          response.status(204).send({ message: "Person deleted" });
        }
      );
    } else {
      response.status(404).send({ message: "Person not found" });
    }
  });
});

// Create a new person in the phonebook
app.post("/api/persons", (request, response) => {
  fs.readFile(path.join("./db.json"), (err, data) => {
    if (err) {
      throw err;
    }
    const phonebookData = JSON.parse(data);
    const { name, number } = request.body;
    if (!name) {
      response.status(400).json({ error: "name missing" });
    } else if (!number) {
      response.status(400).json({ error: "number missing" });
    } else if (phonebookData.find((person) => person.name === name)) {
      response.status(400).json({ error: "name must be unique" });
    } else {
      const id = Math.floor(Math.random() * 1000000);
      const newPerson = { id, name, number };
      phonebook = [...phonebookData, newPerson];
      fs.writeFile(path.join("./db.json"), JSON.stringify(phonebook), (err) => {
        if (err) {
          throw err;
        }
        console.log("The file has been saved!");
      });
      response.json(newPerson);
    }
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
