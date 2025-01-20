require('dotenv').config();

const express = require('express')
const app = express()

app.use(express.static('dist'))
app.use(express.json())

const cors = require('cors')
app.use(cors())

const morgan = require('morgan')
morgan.token('body', (req) => {
    return JSON.stringify(req.body); // Convert the body to a string
  });
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

const Contact = require('./models/contacts')

const name = "name";
const number = "number";
const id = "id";

let persons = [
  {
    name: "Alan Turing",
    number: "+1 132 654 9870",
    id: "1"
  },
  {
    name: "Grace Hopper",
    number: "+1 555-123-4567",
    id: "2"
  },
  {
    name: "Marie Curie",
    number: "987-654-3210",
    id: "3"
  },
  {
    name: "Nikola Tesla",
    number: "+44 20 7946 0958",
    id: "4"
  },
  {
    name: "Charles Babbage",
    number: "222-333-4444",
    id: "5"
  },
  {
    name: "Rosalind Franklin",
    number: "+1 777-888-9999",
    id: "6"
  },
  {
    name: "Katherine Johnson",
    number: "555-666-7777",
    id: "7"
  },
  {
    name: "Carl Sagan",
    number: "+1 888-999-0000",
    id: "8"
  }
] 
  

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response) => {
  Contact.find({}).then(contacts => {
    if(contacts){
      response.json(contacts)
    } else {
      response.status(404).end()
    }
  })
  .catch(error => {
    console.log(error)
    response.status(500).end()
  })
})

app.get('/info', (request, response, next) => {
  Contact.countDocuments({})
      .then(count => {
          const info = `Phonebook has info for ${count} people.`;
          const date = new Date();
          const formattedDate = date.toString();

          const htmlResponse = `
              <body>
                  <p>${info}</p>
                  <p>${formattedDate}</p>
              </body>
          `;

          response.send(htmlResponse);
      })
      .catch(error => {
          console.error('Error fetching data:', error);
          next(error); 
      });
});


app.get('/api/persons/:id', (request, response, next) => {
  Contact.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end() 
      }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Contact.findByIdAndDelete(request.params.id)
      .then(result => {
          response.status(204).end()
      })
      .catch(error => next(error))
})


app.post('/api/persons', (request, response, next) => {
  const {name,number} = request.body
  if(name === undefined){
      return response.status(400).json({
          error: 'name missing'
      })
  }
  const person = new Contact({
      name: name,
      number: number
  })
  person.save().then(savedPerson => {
      response.json(savedPerson)
  })
  .catch(error => {
    next(error); 
  });
})

app.put('/api/persons/:id', (request, response, next) => {
  const {name,number} = request.body

  const person = {
      name: name,
      number: number,
  }
  Contact.findByIdAndUpdate(request.params.id, 
    {name, number}, 
    {new: true, runValidators: true, context:'query'})
      .then(updatedPerson => {
          response.json(updatedPerson)
          console.log(updatedPerson)
      })
      .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if(error.name === 'CastError') {
      return response.status(400).send({error: 'malformatted id'})
  } else if (error.name === 'ValidationError') {    
    return response.status(400).json({ error: error.message })
  }
  next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT || 3002
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})