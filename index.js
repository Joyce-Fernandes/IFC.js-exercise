import express from 'express'
import { dirname } from 'path'

const port = 3000

const app = express()

app.use(express.static(dirname('./')))

app.listen(port, () => {
  console.log(`⚡ Joyce IFC Server ⚡`, port)
})

app.get('/', (req, res) => {
  res.sendFile('index.html', { root: './' })
})