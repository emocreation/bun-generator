import { expect, test } from 'bun:test'
import { rm } from 'node:fs/promises'

test('should create a new bun project', async () => {
  // Define the project name for testing
  const projectName = 'test-app'
  try {
    // Run the create-bun-app command with the project name as an argument
    const proc = Bun.spawn(['bun', 'run', 'test', projectName])
    const output = await proc.stdout.text()
    console.log(output)
    await proc.exited
    // Check if the package.json file was created in the project directory
    const packageJsonExists = await Bun.file(
      `${projectName}/package.json`
    ).exists()
    expect(packageJsonExists).toBe(true)
    // Check whether prettier was added as a dev dependency in package.json
    const packageJson = await Bun.file(`${projectName}/package.json`).json()
    expect(packageJson.devDependencies).toHaveProperty('prettier')
    // Check if the .prettierrc.json file was created in the project directory
    const prettierConfigExists = await Bun.file(
      `${projectName}/.prettierrc.json`
    ).exists()
    expect(prettierConfigExists).toBe(true)
    // Check if the build.ts file was created in the project directory
    const buildConfigExists = await Bun.file(`${projectName}/build.ts`).exists()
    expect(buildConfigExists).toBe(true)
  } catch (error) {
    throw error
  } finally {
    // Clean up by removing the created project directory
    await rm(projectName, { recursive: true, force: true })
  }
})
