require("dotenv").config();
const Person = require("./models/person");
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const app = express();
app.use(express.static("dist"));
app.use(cors());
app.use(express.json());
/* app.use(requestLogger); */
app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms :content"
  )
);

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
  Person.countDocuments().then((result) => {
    response.send(
      `<p>Phonebook has info for ${result} people
        <br/>
        ${new Date()}</p>`
    );
  });
});

app.get("/api/persons/:id", (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

app.get("/api/persons", (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons);
  });
});

app.delete("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

app.put("/api/persons/:id", (request, response, next) => {
  const body = request.body;
  const person = {
    content: {
      name: body.content.name,
      number: body.content.number,
    },
  };

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then((updatedPerson) => {
      response.json(updatedPerson);
    })
    .catch((error) => next(error));
});

const generateId = () => {
  /* const maxId = persons.length > 0 ? Math.max(...persons.map((n) => n.id)) : 0;
        maxId + 1; */
  return Math.floor(Math.random() * 100000);
};

app.post("/api/persons", (request, response) => {
  console.log("TRYING TO POST");
  const body = request.body;

  const person = new Person({
    content: {
      name: body.content.name,
      number: body.content.number,
      id: generateId() /* Kan egentlig slette denne nå?? */,
    },
  });
  console.log(person);

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
  console.log("Should save at this point");

  person.save().then((savedPerson) => {
    response.json(savedPerson);
  });
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.use(unknownEndpoint);
const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  }

  next(error);
};

// this has to be the last loaded middleware.
app.use(errorHandler);
