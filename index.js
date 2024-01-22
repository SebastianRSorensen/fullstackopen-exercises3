const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const app = express();
app.use(cors());

/* const requestLogger = (request, response, next) => {
  console.log("Method:", request.method);
  console.log("Path:  ", request.path);
  console.log("Body:  ", request.body);
  console.log("---");
  next();
}; */

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

morgan.token("content", (req) => {
  return JSON.stringify(req.body.content);
});

app.use(express.json());
/* app.use(requestLogger); */
app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms :content"
  )
);
app.use(express.static("dist"));

let persons = [
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

app.get("/", (request, response) => {
  response.send("<h1>Hello World!</h1>");
});

app.get("/info", (request, response) => {
  const result = persons.length;
  response.send(
    `<p>Phonebook has info for ${result} people
        <br/>
        ${new Date()}</p>`
  );
});

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find((person) => person.id === id);
  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
});

app.get("/api/persons", (request, response) => {
  response.json(persons);
});

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter((person) => person.id !== id);
  response.status(204).end();
});

const generateId = () => {
  /* const maxId = persons.length > 0 ? Math.max(...persons.map((n) => n.id)) : 0;
        maxId + 1; */
  return Math.floor(Math.random() * 100000);
};

app.post("/api/persons", (request, response) => {
  console.log("TRYING TO POST");
  const body = request.body;

  const person = {
    name: body.content.name,
    number: body.content.number,
    id: generateId(),
  };

  if (persons.find((person) => person.name === body.content.name)) {
    return response.status(400).json({
      error: "name must be unique",
    });
  }
  if (!body.content.number) {
    return response.status(400).json({
      error: "missing number",
    });
  }
  if (!body.content.name) {
    return response.status(400).json({
      error: "missing name",
    });
  }

  persons = persons.concat(person);

  response.json(person);
});

app.use(unknownEndpoint);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
