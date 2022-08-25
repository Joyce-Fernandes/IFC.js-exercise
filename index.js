import express from 'express'
import { dirname } from 'path'
import path from 'path'
import { fileURLToPath } from 'url'

const initServer = () => {
  const port = 3000

  console.log(port, 'port')

  const app = express()

  const __filename = fileURLToPath(import.meta.url);

  console.log('__filename', __filename)

  const __dirname = path.dirname(__filename)

  console.log('__dirname', __dirname)

  app.use(express.static(__dirname))

  app.listen(port, () => {
    console.log(`⚡ Joyce IFC Server ⚡`, port)
  })

  app.get('/', (req, res) => {
    console.log('before-render'. __dirname)

    res.sendFile(path.join(__dirname, 'index.html'))
  })
}

console.log('before-func **********************')

initServer()