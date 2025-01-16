const express = require('express')
const morgan = require('morgan')
const app = express()

app.use(express.json())

const cors = require('cors')
app.use(cors())

app.use(express.static('dist'))

morgan.token('body', (req) => {
    return JSON.stringify(req.body); // Convert the body to a string
  });

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

// const unknownEndpoint = (request, response) => {
//     response.status(404).send({ error: 'unknown endpoint' })
//   }
// app.use(unknownEndpoint)

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
  response.json(persons)
})

app.get('/info', (request, response) => {
    const info = `Phonebook has info for ${persons.length} people.`
    const date = new Date();
    const formattedDate = date.toString()
    const htmlResponse = `
        <body>
            <p>${info}</p>
            <p>${formattedDate}</p>
        </body>
        </html>
    `
    response.send(htmlResponse)
})

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const person = persons.find(person => person.id === id)
    console.log(id)
    if(person){
        response.json(person)
    } else {
        response.status(404).end()
    }
  })

app.delete('/api/persons/:id', (request, response) => {
const id = request.params.id
persons = persons.filter(note => note.id !== id)

response.status(204).end()
})

const generateId = () => {
    const maxId = persons.length > 0
    ? Math.max(...persons.map(n => Number(n.id)))
    : 0

    return String(maxId + 1)
}

app.post('/api/persons', (request, response) => {
    const body = request.body

    if(!(body.name && body.number)){
        return response.status(400).json({
            error: 'info missing'
        })
    }

    if(persons.find(person => person.name === body.name)){
        return response.status(400).json({
            error: 'Name exists already!'
        })
    }

    const person = {
        name : body.name,
        number : body.number,
        id : generateId()
    }

    persons = persons.concat(person)
    response.json(person)
})


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})