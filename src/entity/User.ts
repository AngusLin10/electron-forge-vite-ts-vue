import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity('user')
export class User {

    @PrimaryGeneratedColumn()
    id: number

    @Column('text')
    firstName: string

    @Column('text')
    lastName: string

    @Column('text')
    age: number

    @Column('text')
    email: string
}
