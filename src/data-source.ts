import "reflect-metadata"
import { DataSource } from "typeorm"
import { Photo } from "./entity/photo"

export const AppDataSource = new DataSource({
    type: "sqlite",
    database: "database.sqlite",
    synchronize: false,
    logging: false,
    entities: [Photo],
    migrations: [],
    subscribers: [],
})
