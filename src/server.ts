import express,  { Request, Response }from "express"
import * as bodyParser from "body-parser"
import path from 'path';

const app = express()

// 使用 body-parser 中間件來解析請求的 JSON 資料
app.use(bodyParser.json())

// 設定靜態資源文件目錄為 public
app.use(express.static(path.join(__dirname, "public")));

app.get('/api', (request: Request, response: Response) => {
  response.json({ date: new Date() })
})

function startServer(port = 3000) {
  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
  })
}

export {
  startServer
}

