import express, { Request, Response } from 'express'
import * as path from "path"
import * as bodyParser from "body-parser"
import { AppDataSource } from './data-source'
import { User } from './entity/User'
import multer from 'multer'
import { CronJob } from 'cron'
import yahooFinance from 'yahoo-finance2'

const job = new CronJob('* * * * *', () => {//五顆*代表每分鐘執行一次
  console.log('You will see this message every second');
})

async function startServer(port = 3000) {
  job.start();

  await AppDataSource.initialize().then(async () => {
    // register express routes from defined application routes
    // Routes.forEach(route => {
    //   (app as any)[route.method](route.route, (req: Request, res: Response, next: NextFunction) => {
    //     const result = (new (route.controller as any))[route.action](req, res, next)
    //     if (result instanceof Promise) {
    //         result.then(result => (result !== null && result !== undefined) ? res.send(result) : undefined)
    //     } else if (result !== null && result !== undefined) {
    //         res.json(result)
    //     }
    //   })
    // })

    // await AppDataSource.manager.save(
    //   AppDataSource.manager.create(User, {
    //     firstName: "Timber",
    //     lastName: "Saw",
    //     age: 27,
    //     email: "qE7g7@example.com"
    //   })
    // )

    // await AppDataSource.manager.save(
    //   AppDataSource.manager.create(User, {
    //     firstName: "Phantom",
    //     lastName: "Assassin",
    //     age: 24,
    //     email: "qE7g7@example.com"
    //   })
    // )
    console.log("Express server has started on port 3000. Open http://localhost:3000/users to see results")
  }).catch((error) => console.log(error))

  const app = express()
  app.use(bodyParser.json())
  app.use(express.static(path.join(__dirname, "public")));

  app.get('/', (req: Request, res: Response) => {
    res.send('Hello World!')
  })
  app.get('/api', (req: Request, res: Response) => {
    res.json({ date: new Date() })
  })

  app.post('/api/upload', multerUpload().single('file'), async (req, res) => {
    const userRepository = AppDataSource.getRepository(User)
    const user = Object.assign(new User(), {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      age: req.body.age,
      email: req.body.email,
      path: req.file.path
    })
    await userRepository.save(user)
    res.json(user)
  })

  app.get('/api/stock/:symbol', async (req: Request, res: Response) => {
    try {
      const { symbol } = req.params
      const { startDate, endDate } = req.query

      if (!symbol) {
        return res.status(400).json({ error: '股票代碼不能為空' })
      }

      const queryOptions = {
        period1: startDate ? new Date(startDate as string) : new Date(new Date().setMonth(new Date().getMonth() - 3)),
        period2: endDate ? new Date(endDate as string) : new Date(),
        interval: '1d' as const
      }

      const result = await yahooFinance.historical(symbol, queryOptions)

      interface HistoricalData {
        date: Date
        open: number
        high: number
        low: number
        close: number
        volume: number
      }

      const formattedData = (result as HistoricalData[]).map((item) => ({
        date: item.date.toISOString().split('T')[0],
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
        volume: item.volume
      }))

      res.json({
        symbol,
        data: formattedData
      })
    } catch (error) {
      console.error('Stock API error:', error)
      const errorMessage = error instanceof Error ? error.message : '未知錯誤'
      res.status(500).json({ 
        error: '獲取股票數據失敗',
        message: errorMessage
      })
    }
  })

  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
  })
}

export {
  startServer
}

function multerUpload() {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(process.cwd(), '/uploads'))
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.fieldname + '-' + uniqueSuffix + '.jpg')
    }
  })

  return multer({ storage: storage })
}

