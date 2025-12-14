import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { AppModule } from '../app.module'
import { WikiIngestService } from '../modules/wiki/wiki.service'

function readTitleFromArgs (): string | null {
  const [, , ...args] = process.argv
  const direct = args.find((arg) => !arg.startsWith('--'))
  const fromFlag = args.find((arg) => arg.startsWith('--title='))

  if (fromFlag != null) {
    return fromFlag.replace('--title=', '')
  }

  return direct ?? null
}

async function bootstrap (): Promise<void> {
  const title = readTitleFromArgs()

  if (title == null || title.length < 2) {
    console.error('Veuillez fournir un titre: npm run api:ingest -- --title=\"Albert Einstein\"')
    process.exit(1)
  }

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log']
  })

  try {
    const wikiService = app.get(WikiIngestService)
    const card = await wikiService.ingestTitle(title)
    console.log(`Carte ingérée: ${card.title} (${card.id})`)
  } catch (error) {
    console.error('Erreur ingestion:', error)
    process.exitCode = 1
  } finally {
    await app.close()
  }
}

bootstrap().catch((error) => {
  console.error('Erreur inattendue', error)
  process.exit(1)
})
