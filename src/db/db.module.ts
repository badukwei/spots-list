import { Global, Module } from '@nestjs/common'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'
import 'dotenv/config'

export const DATABASE = 'DATABASE'
export type DrizzleDB = ReturnType<typeof drizzle<typeof schema>>

@Global()
@Module({
  providers: [
    {
      provide: DATABASE,
      useFactory: () => {
        const client = postgres(process.env.DATABASE_URL!)
        return drizzle(client, { schema })
      },
    },
  ],
  exports: [DATABASE],
})
export class DbModule {}
