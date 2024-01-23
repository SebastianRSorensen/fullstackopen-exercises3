const mongoose = require("mongoose");

if (process.argv.length < 3) {
  console.log("give password as argument");
  process.exit(1);
}

const password = process.argv[2];

const url = `mongodb+srv://helsinkifullstack:${password}@helsinkiproject.y3vneuf.mongodb.net/?retryWrites=true&w=majority`;

mongoose.set("strictQuery", false);
mongoose.connect(url);

const personSchema = new mongoose.Schema({
  content: {
    name: String,
    number: String,
  },
});

const Person = mongoose.model("Person", personSchema);

const person = new Person({
  content: {
    name: process.argv[3],
    number: process.argv[4],
  },
});

if (process.argv.length === 3) {
  console.log("phonebook:");
  Person.find({}).then((result) => {
    result.forEach((note) => {
      console.log(note.content.name, note.content.number);
    });
    mongoose.connection.close();
  });
} else {
  person.save().then((result) => {
    console.log("person saved!");
    mongoose.connection.close();
  });
}
