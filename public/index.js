import express from 'express'
import { dirname } from 'path'
import path from 'path'
import { fileURLToPath } from 'url'

const initServer = () => {
  const port = 3000

  const app = express()

  const __filename = fileURLToPath(import.meta.url);

  const __dirname = path.dirname(__filename);

  app.use(express.static(__dirname))

  app.listen(port, () => {
    console.log(`⚡ Joyce IFC Server ⚡`, port)
  })

  app.get('/', (req, res) => {
    res.sendFile('index.html', { root: __dirname } )
  })
}

initServer()