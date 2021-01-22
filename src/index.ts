// eslint-disable-next-line import/no-extraneous-dependencies
import { AutotranslationFunction } from 'ubersetz'
import deepl, { kill } from 'deapl'
import PQueue from 'p-queue'

const queue = new PQueue({ concurrency: 10 })
type SourceLanguage = Parameters<typeof deepl>[1]['sourceLanguage']
type TargetLanguage = Parameters<typeof deepl>[1]['targetLanguage']

const sourceLanguages: SourceLanguage[] = ['en', 'de', 'fr', 'es', 'pt', 'it', 'nl', 'pl', 'ru']
const targetLanguages: TargetLanguage[] = [
  'en-US', 'en-GB', 'de-DE', 'fr-FR',
  'es-ES', 'pt-PT', 'pt-BR', 'it-IT',
  'nl-NL', 'pl-PL', 'ru-RU', 'ja-JA',
  'zh-ZH',
]

const translate: AutotranslationFunction = async (options) => {
  const sourceLanguage = options.sourceLanguage
    ? options.sourceLanguage.substr(0, 2).toLowerCase() as SourceLanguage
    : undefined
  if (sourceLanguage && !sourceLanguages.includes(sourceLanguage)) {
    throw new Error(`Invalid source language '${sourceLanguage}'. It must be one of these: ${sourceLanguages.join(', ')}`)
  }

  const targetLanguage = `${options.targetLanguage.substr(0, 2).toLowerCase()}-${options.targetLanguage.substr(3, 2).toUpperCase()}` as TargetLanguage
  if (!targetLanguages.includes(targetLanguage)) {
    throw new Error(`Invalid target language '${targetLanguage}'. It must be one of these: ${targetLanguages.join(', ')}`)
  }

  return {
    text: await queue.add(() => deepl(options.text, {
      sourceLanguage,
      targetLanguage,
      formality: options.informal ? 'informal' : 'formal',
      defaultDelay: 250,
    })),
  }
}

translate.kill = () => kill()

export default translate
