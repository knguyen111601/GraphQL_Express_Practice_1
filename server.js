const express = require("express") // import express
const {graphqlHTTP} = require('express-graphql')
const {
    GraphQLSchema,
    GraphQLObjectType, // lets you write dynamic types
    GraphQLString,
    GraphQLList,
    GraphQLInt,
    GraphQLNonNull
} = require("graphql")
const app = express() 

const authors = [
	{ id: 1, name: 'J. K. Rowling' },
	{ id: 2, name: 'J. R. R. Tolkien' },
	{ id: 3, name: 'Brent Weeks' }
]

const books = [
	{ id: 1, name: 'Harry Potter and the Chamber of Secrets', authorId: 1 },
	{ id: 2, name: 'Harry Potter and the Prisoner of Azkaban', authorId: 1 },
	{ id: 3, name: 'Harry Potter and the Goblet of Fire', authorId: 1 },
	{ id: 4, name: 'The Fellowship of the Ring', authorId: 2 },
	{ id: 5, name: 'The Two Towers', authorId: 2 },
	{ id: 6, name: 'The Return of the King', authorId: 2 },
	{ id: 7, name: 'The Way of Shadows', authorId: 3 },
	{ id: 8, name: 'Beyond the Shadows', authorId: 3 }
]

// // Schema 
// const schema = new GraphQLSchema({
//     query: new GraphQLObjectType({ // Creating object with name HelloWorld that contains messages that are type strings
//         name: "HelloWorld", 
//         fields: ()=> ({ // fields of the object to query
//             message: {
//                 type: GraphQLString, // Make the resolve must return a string
//                 resolve: (parent, args) => "Hello World" // What actual information the query should return
//             }
//         })
//     })
// })

// Root Query

const AuthorType = new GraphQLObjectType({
    name: "Author",
    description: "This represents an author of a book",
    fields: () => ({ // reason for returning function in field is to have AuthorType and BookType defined before call
        id: { type: GraphQLNonNull(GraphQLInt) }, // Id is an integer that cannot be null
        name: { type: GraphQLNonNull(GraphQLString) },
        books: {
            type: new GraphQLList(BookType),
            resolve: (author) => {
                return books.filter(book => author.id === book.authorId) //.filter to return the array of matching books
            }
        }
    })
})

const BookType = new GraphQLObjectType({
    name: "Book",
    description: "This represents a book written by an author",
    fields: () => ({ // reason for returning function in field is to have AuthorType and BookType defined before call
        id: { type: GraphQLNonNull(GraphQLInt) }, // Id is an integer that cannot be null
        name: { type: GraphQLNonNull(GraphQLString) },
        authorId: { type: GraphQLNonNull(GraphQLInt) },
        author: { 
            type: AuthorType, // Custom author type to retrieve the details of author
            resolve: (book) => { // book in the parameter is the "parent" argument
                return authors.find(author => author.id === book.authorId) // return where the ids match
            }    
        }
    })
})

const RootQueryType = new GraphQLObjectType({
    name: "Query",
    description: "Root Query",
    fields: () => ({
        book: { // Query for a single book
            type: BookType,
            description: "Single Book",
            args: { // declare what kind of arguments can be taken 
                id: { type: GraphQLInt }
            },
            resolve: (parent, args) => books.find(book => book.id === args.id) // return matching 
        },
        books: {
            type: new GraphQLList(BookType), // custom GraphQL Type for list of all books
            description: "List of all books",
            resolve: () => books
        },
        author: {
            type: AuthorType,
            description: "Single Author",
            args: {
                id: {type: GraphQLInt}
            },
            resolve: (parent, args) => authors.find(author => args.id === author.id)
        },
        authors: {
            type: new GraphQLList(AuthorType),
            description: "List of all authors",
            resolve: () => authors
        }
    })
})

// POST, PUT, DELETE in REST API
const RootMutationType = new GraphQLObjectType({
    name: "Mutation",
    description: "Root Mutation",
    fields: () => ({
        addBook: { // Add Book Function (POST)
            type: BookType,
            description: "Add a Book",
            args: {
                name: { type: GraphQLNonNull(GraphQLString) },
                authorId: { type: GraphQLNonNull(GraphQLInt) }
            },
            resolve: (parent, args) => {
                const book = {id: books.length+1, name: args.name, authorId: args.authorId}
                books.push(book)
                return book
            }
        },
        updateBook: { // Update a books name and author (PUT)
            type: BookType,
            description: "Update a book",
            args: {
                id: { type: GraphQLNonNull(GraphQLInt) },
                name: { type: GraphQLNonNull(GraphQLString) },
                authorId: {type: GraphQLNonNull(GraphQLInt)}
            },
            resolve: (parent, args) => {
                const updatedBook = {id: args.id, name: args.name, authorId: args.authorId}
                books.splice(args.id-1, 1, updatedBook)
                return updatedBook
            }
        },
        deleteBook: { // Deletes a book (DELETE)
            type: BookType,
            description: "Delete a book",
            args:{
                id: { type: GraphQLNonNull(GraphQLInt)}
            },
            resolve: (parent, args) => {
                const deletedBook = {id: books[args.id-1].id, name: books[args.id-1].name, authorId: books[args.id-1].authorId}
                books.splice(args.id-1, 1)
                return deletedBook
            }
        },
        addAuthor: { // Add Author Function (POST)
            type: AuthorType,
            description: "Add a Author",
            args: {
                name: { type: GraphQLNonNull(GraphQLString) }
            },
            resolve: (parent, args) => {
                const author = {id: authors.length+1, name: args.name}
                authors.push(author)
                return author
            }
        },
        updateAuthor: { // Update a author name (PUT)
            type: AuthorType,
            description: "Update an author",
            args: {
                id: { type: GraphQLNonNull(GraphQLInt) },
                name: { type: GraphQLNonNull(GraphQLString) }
            },
            resolve: (parent, args) => {
                const updatedAuthor = {id: args.id, name: args.name}
                authors.splice(args.id-1, 1, updatedAuthor)
                return updatedAuthor
            }
        },
        deleteAuthor: { // Deletes an author (DELETE)
            type: AuthorType,
            description: "Delete an author",
            args:{
                id: { type: GraphQLNonNull(GraphQLInt)}
            },
            resolve: (parent, args) => {
                const deletedAuthor = {id: authors[args.id-1].id, name: authors[args.id-1].name}
                authors.splice(args.id-1, 1)
                return deletedAuthor
            }
        },
    })
})

const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType
})


// Routes/Router

app.use('/graphql', graphqlHTTP({
    schema: schema,
    graphiql: true
}))

// App Listener
app.listen(5000, () => console.log('Server Running'))