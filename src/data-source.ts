import { DataSource } from "typeorm"
import { User } from './entity/User'
import { User1709803221770 } from './migration/1709803221770-user'
import { User1709864174745 } from './migration/1709864174745-user'
import { User1710746787056 } from './migration/1710746787056-user'

export const AppDataSource = new DataSource({
    type: "sqlite",
    database: "database.sqlite",
    synchronize: false,
    migrationsRun: true,
    logging: false,
    entities: [User],
    migrations: [User1709803221770, User1709864174745, User1710746787056],
    // migrations: [User1709803221770],
    subscribers: [],
})
