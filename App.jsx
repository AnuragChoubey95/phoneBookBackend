import { useState, useEffect } from 'react'
import Filter from './components/Filter'
import Person from './components/Person'
import PersonForm from './components/PersonForm'

import phoneService from './services/phoneBookServices'

import './index.css'

const Notification = ({ message, classStyle}) => {
  if (message === null) {
    return null
  }

  return (
    <div className={classStyle}>
      {message}
    </div>
  )
}

const App = () => {
  const [persons, setPersons] = useState([])
  const [message, setMessage] = useState(null)
  const [classStyle, setclassStyle] = useState(null)
  
  useEffect(() => {
    phoneService
      .getAll()
        .then(initContacts => {
          setPersons(initContacts)
        })
  }, [])

  const initNameState = ''
  const initNumberState = ''
  const [newName, setNewName] = useState(initNameState)
  const [newNumber, setNewNumber] = useState(initNumberState)
  
  const handleNameChange = (event) => setNewName(event.target.value)
  const handleNumberChange = (event) => setNewNumber(event.target.value)
  
  const addPerson = (event) => {
    event.preventDefault()
    const newPersonObject = {
      name : newName,
      number : newNumber
    }

    if (persons.find(person => person.name === newName)) {
      const personToUpdate = persons.find(person => person.name === newName)
      const updateID = personToUpdate.id
      if (window.confirm(`Update ${personToUpdate.name}'s number?`)){
        phoneService.update(updateID, newPersonObject)
          .then(changedPerson => {
            setPersons(persons.map(p => p.id === updateID ? changedPerson : p))
            setclassStyle('success')
            setMessage(`${newName}'s number updated`)
            setTimeout(() => {setMessage(null)}, 5000)
          })
      }
    } else if (newNumber === initNumberState) {
      alert("Please enter a number")
    } else {
      phoneService
        .create(newPersonObject)
          .then(returnedPerson => {
            setPersons(persons.concat(returnedPerson))
            setNewName(initNameState)
            setNewNumber(initNumberState)
            setclassStyle('success')
            setMessage(`${newName} added`)
            setTimeout(() => {setMessage(null)}, 5000)
          }).catch(error => {
            // this is the way to access the error message
            setclassStyle('error')
            setMessage(error.response.data.error)
            setTimeout(() => {setMessage(null)}, 5000)
            console.log(error.response.data.error)
          })
    }
  }

  const deletePerson = (id) => {
    const personToDelete = persons.find(person => person.id === id);
    if (window.confirm(`Delete ${personToDelete.name}?`)) {
      phoneService.remove(id)
        .then((response) => {
          console.log(response)
          setPersons(persons.filter(person => person.id !== id));
          setclassStyle('success')
          setMessage(`${personToDelete.name}'s number deleted from the server.`)
          setTimeout(() => {setMessage(null)}, 5000)
        })
        .catch(error => {
          setclassStyle('error')
          setMessage(`The contact '${personToDelete.name}' was already deleted from the server.`)
          // setPersons(persons.filter(person => person.id !== id));
          setTimeout(() => {setMessage(null)}, 5000)
        });
    }
  };
  

  // Filter Logic Start -->
  const initFilter = ''
  const [filterSubstr, setFilterSubstr] = useState(initFilter)
  const handleFilterChange = (event) => setFilterSubstr(event.target.value)
  const filterBySubstring = (list, substring) => {
    return list.filter(item => item.name.toLowerCase().includes(substring.toLowerCase()))
  }
  const personsToShow = filterBySubstring(persons, filterSubstr)
  // <-- Filter Logic End


  return (
    <div>
      <h1>Phonebook</h1>
      <Notification message={message} classStyle={classStyle}/>
      <Filter filterString={filterSubstr} handler={handleFilterChange}/>
      <PersonForm 
        name={newName}
          number={newNumber} 
            handleName={handleNameChange}
              handleNumber={handleNumberChange} 
                onSubmit={addPerson}/>
      <h2>Numbers</h2>
        <>
        {personsToShow.map(person => (
          <Person
            key={person.id}
            name={person.name}
            number={person.number}
            delPerson={() => deletePerson(person.id)}
          />
        ))}
        </>
    </div>
  )
}

export default App
