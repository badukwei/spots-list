import { Global, Inject, Module, OnApplicationShutdown } from '@nestjs/common'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'
import 'dotenv/config'

export const DATABASE = 'DATABASE'
export const PG_CLIENT = 'PG_CLIENT'
export type DrizzleDB = ReturnType<typeof drizzle<typeof schema>>

@Global()
@Module({
  providers: [
    {
      provide: PG_CLIENT,
      useFactory: () => {
        if (!process.env.DATABASE_URL) {
          throw new Error('DATABASE_URL is not set')
        }
        return postgres(process.env.DATABASE_URL)
      },
    },
    {
      provide: DATABASE,
      useFactory: (client: ReturnType<typeof postgres>) =>
        drizzle(client, { schema }),
      inject: [PG_CLIENT],
    },
  ],
  exports: [DATABASE],
})
export class DbModule implements OnApplicationShutdown {
  constructor(@Inject(PG_CLIENT) private readonly client: ReturnType<typeof postgres>) {}

  async onApplicationShutdown() {
    await this.client.end()
  }
}
