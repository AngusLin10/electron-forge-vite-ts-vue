import express, { NextFunction, Request, Response } from 'express'
import * as path from "path"
import * as bodyParser from "body-parser"
import { AppDataSource } from './data-source'
import { Routes } from './routes'
import { User } from './entity/User'

function startServer(port = 3000) {
  AppDataSource.initialize().then(async () => {
    const app = express()
    app.use(bodyParser.json())
    app.use(express.static(path.join(__dirname, "public")));
    app.get('/api', (req: Request, res: Response) => {
      res.json({ date: new Date() })
    })

    // register express routes from defined application routes
    Routes.forEach(route => {
      (app as any)[route.method](route.route, (req: Request, res: Response, next: NextFunction) => {
        const result = (new (route.controller as any))[route.action](req, res, next)
        if (result instanceof Promise) {
            result.then(result => (result !== null && result !== undefined) ? res.send(result) : undefined)
        } else if (result !== null && result !== undefined) {
            res.json(result)
        }
      })
    })

    app.listen(port, () => {
      console.log(`Example app listening at http://localhost:${port}`)
    })

    await AppDataSource.manager.save(
      AppDataSource.manager.create(User, {
        firstName: "Timber",
        lastName: "Saw",
        age: 27,
        email: "qE7g7@example.com"
      })
    )

    await AppDataSource.manager.save(
      AppDataSource.manager.create(User, {
        firstName: "Phantom",
        lastName: "Assassin",
        age: 24,
        email: "qE7g7@example.com"
      })
    )

    console.log("Express server has started on port 3000. Open http://localhost:3000/users to see results")

  }).catch((error: any) => console.log(error))
}

export {
  startServer
}

