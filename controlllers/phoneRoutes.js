const phoneRouter = require('express').Router()
const Contact = require('../models/contacts')


phoneRouter.get('/', (request, response) => {
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


phoneRouter.get('/info', (request, response, next) => {
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


phoneRouter.get('/:id', (request, response, next) => {
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


phoneRouter.delete('/:id', (request, response, next) => {
  Contact.findByIdAndDelete(request.params.id)
    .then(response => {
      response.status(204).end()
    })
    .catch(error => next(error))
})


phoneRouter.post('/', (request, response, next) => {
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


phoneRouter.put('/:id', (request, response, next) => {
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

module.exports = phoneRouter