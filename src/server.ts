import express, { Request, Response } from 'express'
import * as path from "path"
import * as bodyParser from "body-parser"
import { AppDataSource } from './data-source'
import { User } from './entity/User'
import multer from 'multer'
import { CronJob } from 'cron'

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

