require('dotenv').config()

const express = require('express')
const app = express()

app.use(express.static('dist'))
app.use(express.json())

const cors = require('cors')
app.use(cors())

const morgan = require('morgan')
morgan.token('body', (req) => {
  return JSON.stringify(req.body) // Convert the body to a string
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

const Contact = require('./models/contacts')

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response) => {
  Contact.find({})
    .then(contacts => {
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
      const info = `Phonebook has info for ${count} people.`
      const date = new Date()
      const formattedDate = date.toString()

      const htmlResponse = `
              <body>
                  <p>${info}</p>
                  <p>${formattedDate}</p>
              </body>
          `

      response.send(htmlResponse)
    })
    .catch(error => {
      console.error('Error fetching data:', error)
      next(error)
    })
})


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
    .then(response => {
      response.status(204).end()
    })
    .catch(error => next(error))
})


app.post('/api/persons', (request, response, next) => {
  const body = request.body
  if(body.name === undefined){
    return response.status(400).json({
      error: 'name missing'
    })
  }
  const person = new Contact({
    name: body.name,
    number: body.number
  })
  person.save()
    .then(savedPerson => {
      response.json(savedPerson)
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const { name,number } = request.body

  Contact.findByIdAndUpdate(request.params.id,
    { name, number },
    { new: true, runValidators: true, context:'query' })
    .then(updatedPerson => {
      response.json(updatedPerson)
      console.log(updatedPerson)
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}
// handler of requests with unknown endpoint
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if(error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
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