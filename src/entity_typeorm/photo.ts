import { Entity, Column, PrimaryGeneratedColumn } from "typeorm"

@Entity()
export class Photo {
  @PrimaryGeneratedColumn() // 自增主键
  id: number

  @Column({ type: 'varchar' }) // Column 普通列
  name: string // js 数据类型

  @Column({ type: 'int' }) // type 数据库键类型
  age: number

  @Column({ type: 'varchar', nullable: true }) // nullable，非必须
  hobby: string
}