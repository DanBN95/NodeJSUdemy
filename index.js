const express = require('express')
const fs = require('fs')
const { request } = require('http')
const app = express()

app.use(express.json())                         // We want to pass a certain post requests as they would be a typical 
app.use(express.urlencoded({extended: true}))   // JSON API

app.get('/',(request, response) => {        // Everytime we hit the root directory we would write hello world            
    return response.send('Hello, World!')
})      

app.get('/todos', (request,response) => {
    const showPending = request.query.showPending           // get inline property

    fs.readFile('./store/todos.json','utf-8', (err,data) => { //encode the file in english and not 
        if (err) {
            return response.status(500).send('Sorry, something went wrong.') // return the client a server side error
        }

        const todos = JSON.parse(data) // we get the data as a string, so we want to parse it as a jason
        
        if (showPending !== "1") {
            return response.json({todos: todos})
        } else {
            return response.json({todos : todos.filter(t => {return t.complete === false})})
        }
        
    }) 
})

app.put('/todos/:id/complete', (request, response) => {
    const id = parseInt(request.params.id)

    const findTodoById = (todos,id) => {
        for (let i = 0; i < todos.length; i++) {
            if (todos[i].id === id) {
                return i;
            }
        }

        return -1;
    }

    fs.readFile('./store/todos.json', 'utf-8', (err,data) => {
        if (err) {
            return response.status(500).send('Sorry, something went wrong.')
        }

        let todos = JSON.parse(data)
        const todosIndex = findTodoById(todos,id)

        if (todosIndex === -1) {
            return response.status(500).send("Sorry, id not found")
        }
        
        todos[todosIndex].complete = true

        fs.writeFile('./store/todos.json',JSON.stringify(todos), () => {  //  stringify return the jason into a string
            return response.json({'status': 'ok'})
        }) 
    })
})

app.post('/todo', (request, response) => {
    if (!request.body.name) {
        return response.status(400).send('Missing name') // '400' error tells that the user sent us wrong values!
    }

    fs.readFile('./store/todos.json', 'utf-8', (err,data) => {
        if (err) {
            return response.status(500).send('Sorry, something went wrong.')
        }

        const todos = JSON.parse(data)
        const maxId = Math.max.apply(Math, todos.map(t => {return t.id})) // map the todos list to id's list

        todos.push({                                     // Pushing a new value to todos list
            id: maxId + 1,
            complete: false,
            name: request.body.name
        })

        fs.writeFile('./store/todos.json',JSON.stringify(todos), () => {  //  stringify return the jason into a string
            return response.json({'status': 'ok'})
        }) 
    })
})

app.listen(3000,() => {         // 
    console.log('Application running on http://localhost:3000')
})