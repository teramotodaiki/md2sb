import path from 'path'
import fs from 'fs'
import command from 'commander'
import md2sb from './../main'
import settings from '../../package.json'

let stdin = ''

command
  .version(settings.version)
  .description(settings.description)
  .usage('\n\tmd2sb [file] \n\tcat hoge.md | md2sb')
  .arguments('[file]')
  .option(
    '-d, --out-dir <dir>',
    'Convert an input directory of markdown files into an output directory'
  )
  .action(async (file, options) => {
    const absolutePath = path.resolve(file)
    if (!options.outDir) {
      // Convert single file
      const result = await md2sb(fs.readFileSync(absolutePath))
      console.log(result)
    } else {
      // Convert files in directory
      if (!fs.statSync(absolutePath).isDirectory()) {
        console.error(`${absolutePath} is not directory!`)
        process.exit(1)
      }
      const files = fs.readdirSync(absolutePath)
      for (const fileName of files) {
        const inputFilePath = path.join(absolutePath, fileName)
        const result = await md2sb(fs.readFileSync(inputFilePath))
        // *.md => *.txt
        const outputFile = path.basename(fileName, '.md') + '.txt'
        const outputFilePath = path.resolve(options.outDir, outputFile)
        fs.writeFileSync(outputFilePath, result)
      }
    }
  })

if (process.stdin.isTTY) {
  command.parse(process.argv)
} else {
  process.stdin.on('readable', () => {
    const chunk = process.stdin.read()
    if (chunk !== null) {
      stdin += chunk
    }
  })
  process.stdin.on('end', async () => {
    console.log(await md2sb(stdin))
  })
}
