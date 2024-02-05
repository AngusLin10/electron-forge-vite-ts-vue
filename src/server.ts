import express from 'express'
import * as path from "path"

const app = express()

app.use(express.static(path.join(__dirname, "public")));

app.get('/api', () => {
  res.json({ date: new Date() })
})

function startServer(port = 3000) {
  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
  })
}

export {
  startServer
}

