const mongoose = require('mongoose')

const password = process.argv[2]
const url = `mongodb+srv://ac2255:${password}@fullstack.julv8.mongodb.net/phoneBook_db?retryWrites=true&w=majority&appName=FullStack`
mongoose.set('strictQuery', false)
mongoose.connect(url)

const contactSchema = new mongoose.Schema({
    name: String,
    number: String,
})

const Contact = mongoose.model('Contact', contactSchema)

if(process.argv.length == 3){
    Contact.find({}).then(result => {
        result.forEach(contact => {
            console.log(`${contact.name} ${contact.number}`)
        })
        mongoose.connection.close()
    })
} else if (process.argv.length == 5){

    const contact = new Contact({
        name: process.argv[3],
        number: process.argv[4],
    })
    
    contact.save().then(result => {
        console.log(`${result.name} with number ${result.number} saved to contacts`)
        mongoose.connection.close()
    })
} else {
    console.log('Usage: node mongo.js <password> <name> <phone_number>')
    process.exit(1)
}





