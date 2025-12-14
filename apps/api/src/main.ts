import 'reflect-metadata'
import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap (): Promise<void> {
  const app = await NestFactory.create(AppModule, { cors: true })

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true
    })
  )

  const port = process.env.PORT ?? 3000
  await app.listen(port)
  console.log(`🚀 MEMEX API ready on http://localhost:${port}`)
}

bootstrap().catch((error) => {
  console.error('Failed to start API', error)
  process.exit(1)
})
