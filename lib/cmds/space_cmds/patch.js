import { createManagementClient } from '../../utils/contentful-clients'
import * as helpers from '../../core/patch/helpers/helpers'
import patchHandler from '../../core/patch/patch-files-handler'
import applyPatches from '../../core/patch/make-patch-hooks'
import { handleAsyncError as handle } from '../../utils/async'
import { assertLoggedIn, assertSpaceIdProvided } from '../../utils/assertions'
import { getContext } from '../../context'
import * as logging from '../../utils/log'

export const command = 'patch'
export const desc = '[BETA] Patch a content type'

export const builder = (yargs) => {
  return yargs
  .option('space-id', { type: 'string', describe: 'Space id' })
  .options('patch-dir', {
    type: 'string',
    describe: 'Directory to read the patch files from',
    default: process.cwd(),
    demand: true,
    alias: 'p'
  })
  .option('dry-run', {
    type: 'boolean',
    describe: 'Do not save the changes to the Content Model',
    default: false
  })
  .option('yes', {
    type: 'boolean',
    describe: 'Automatically confirm each patch',
    default: false
  })
  .epilog('Copyright 2017 Contentful, this is a BETA release')
}

export const handler = handle(async function (argv) {
  await assertLoggedIn()
  await assertSpaceIdProvided(argv)

  const context = await getContext()
  const {activeSpaceId, cmaToken} = context
  const spaceId = argv.spaceId || activeSpaceId

  const patchFilePaths = await helpers.readPatchDir(argv.patchDir)
  const args = {
    spaceId,
    accessToken: cmaToken,
    patchFilePaths,
    yes: argv.yes,
    dryRun: argv.dryRun
  }

  await patchHandler(args, createManagementClient, applyPatches, helpers, logging)
})