#!/usr/bin/env bun

import { checkStringPresent } from '@emohk/utils'

const runCommand = async (
  command: string,
  args: string[] = [],
  options: any = {}
) => {
  const proc = Bun.spawn([command, ...args], options)
  const output = await proc.stdout.text()
  console.log(output)
  await proc.exited
}

const main = async () => {
  // Read project name from command line arguments or prompt the user
  const args = Bun.argv.slice(2)
  let projectName = args[0] ?? ''
  if (!checkStringPresent(projectName)) {
    const prompt = 'Enter project name: '
    process.stdout.write(prompt)
    for await (const line of console) {
      if (checkStringPresent(line)) {
        projectName = line
        break
      }
      process.stdout.write(prompt)
    }
  }
  // Create the project using bun init
  console.log(`\nCreating project: ${projectName}`)
  await runCommand('bun', ['init', projectName, '-y'])
  // Install prettier and download the config file
  console.log('Installing prettier\n')
  await runCommand('bun', ['add', '-d', 'prettier'], { cwd: projectName })
  console.log('Downloading prettier config')
  const prettierConfigFileName = '.prettierrc.json'
  const prettierConfigUrl = `https://raw.githubusercontent.com/emocreation/common-resources/refs/heads/main/${prettierConfigFileName}`
  const prettierConfigJson = await fetch(prettierConfigUrl)
  if (prettierConfigJson.ok) {
    console.log('Saving prettier config')
    await Bun.write(
      `${projectName}/${prettierConfigFileName}`,
      prettierConfigJson
    )
  } else {
    console.error(
      'Failed to download prettier config from URL:',
      prettierConfigUrl
    )
  }
  // Create build configuration file
  console.log('Creating build configuration file')
  const buildConfigFileName = 'build.ts'
  const buildConfigContent = `await Bun.build({
  entrypoints: ['./index.ts'],
  outdir: './dist',
  target: 'bun',
  minify: true
})`
  await Bun.write(`${projectName}/${buildConfigFileName}`, buildConfigContent)
  // Modify package.json to add build script to call: bun run build.ts
  const packageJsonPath = `${projectName}/package.json`
  const packageJson = await Bun.file(packageJsonPath).json()
  packageJson.scripts = {
    ...packageJson.scripts,
    dev: 'bun run index.ts',
    build: 'bun run build.ts'
  }
  await Bun.write(packageJsonPath, JSON.stringify(packageJson, null, 2))
  // Done
  console.log('Done')
}

main()
