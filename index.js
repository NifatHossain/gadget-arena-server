const express = require('express')
const app = express()
require('dotenv').config()
var cors = require('cors')
const port = process.env.PORT || 3000

app.use(express.json())
app.use(cors({
    origin:[
        'http://localhost:5173/',
    ]
}))
app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})