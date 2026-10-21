import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'

const applicationRoot = fileURLToPath(new URL('../', import.meta.url))
const configuration = JSON.parse(readFileSync(resolve(applicationRoot, 'project-workflow.json'), 'utf8'))
const taskBranch = /^(?:codex\/)?(?:feat|fix|hotfix|docs|refactor|chore|test|style|release)\/[a-z0-9][a-z0-9./-]*$/
const sensitivePath = /(?:^|\/)(?:\.env(?:\..*)?|[^/]*\.(?:pem|p12|pfx|dump)|id_(?:rsa|ed25519))$/i

function git(cwd, args, allowed = [0]) {
  const result = spawnSync('git', args, { cwd, encoding: 'utf8', timeout: 60000 })
  if (result.error || !allowed.includes(result.status)) {
    // Raw Git stderr may include credential-bearing URLs.
    throw new Error(`Git inspection failed: ${args[0]}. No repair was attempted.`)
  }
  return { output: result.stdout, status: result.status }
}

function exists(cwd, ref) {
  return git(cwd, ['rev-parse', '--verify', '--quiet', ref], [0, 1]).status === 0
}

function comparison(cwd, ref) {
  if (!exists(cwd, ref)) return null
  const [ahead, behind] = git(cwd, ['rev-list', '--left-right', '--count', `HEAD...${ref}`])
    .output.trim().split(/\s+/).map(Number)
  return { ref, ahead, behind, diverged: ahead > 0 && behind > 0 }
}

export function inspectRepository({ cwd = process.cwd(), fetch = false } = {}) {
  const root = git(cwd, ['rev-parse', '--show-toplevel']).output.trim()
  const hasOrigin = git(root, ['remote']).output.split(/\r?\n/).includes('origin')
  if (fetch) {
    if (!hasOrigin) throw new Error('No origin remote configured. No remote was added.')
    git(root, ['fetch', '--prune', 'origin'])
  }
  if (!exists(root, 'HEAD')) throw new Error('Repository has no commit yet. Review initial setup manually.')
  const branch = git(root, ['symbolic-ref', '--quiet', '--short', 'HEAD'], [0, 1]).output.trim() || null
  const upstreamResult = git(root, ['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{upstream}'], [0, 128])
  const upstream = upstreamResult.status === 0 ? comparison(root, upstreamResult.output.trim()) : null
  const integration = comparison(root, `origin/${configuration.integrationBranch}`)
  const production = comparison(root, `origin/${configuration.productionBranch}`)
  const tracked = git(root, ['ls-files', '-z']).output.split('\0').filter(Boolean)
  const staged = git(root, ['diff', '--cached', '--name-only', '-z']).output.split('\0').filter(Boolean)
  const riskyPaths = [...new Set([...tracked, ...staged].filter(path => sensitivePath.test(path)))]
  const dirty = Boolean(git(root, ['status', '--porcelain=v1', '-z', '--untracked-files=all']).output)
  const protectedBranch = [configuration.integrationBranch, configuration.productionBranch, 'dev'].includes(branch)
  const blockers = []
  if (!branch) blockers.push('Detached HEAD; choose an intentional task baseline before editing.')
  if (protectedBranch) blockers.push('Protected/integration branch; create a scoped task branch before edits.')
  if (branch && !protectedBranch && !taskBranch.test(branch)) blockers.push('Task branch does not follow the documented type/topic naming.')
  if (dirty) blockers.push('Working tree has edits. Preserve and review ownership before starting another task.')
  if (!integration) blockers.push('Integration remote ref unavailable; baseline cannot be verified.')
  if (upstream?.behind) blockers.push('Upstream contains commits not in HEAD. Review synchronization; do not blindly pull.')
  if (integration?.behind) blockers.push('Integration contains commits not in HEAD. Review task baseline before continuing.')
  if (riskyPaths.length) blockers.push('Sensitive filenames are tracked/staged. Review privately before publication.')
  const sameProductionTree = production
    ? git(root, ['diff', '--quiet', 'HEAD', production.ref], [0, 1]).status === 0
    : null
  return {
    branch, sourceCommit: git(root, ['rev-parse', 'HEAD']).output.trim(),
    fetchedNow: fetch, hasOrigin, dirty, upstream, integration, production,
    sameProductionTree, sensitivePathCount: riskyPaths.length, blockers,
    notes: [
      ...(!fetch ? ['Remote refs are cached. Use --fetch for a fresh synchronization audit.'] : []),
      ...(!upstream ? ['No branch upstream. Normal for an unpublished task branch; no remote branch was created.'] : []),
      'Filename checks are not a content secret scan. Review the staged diff privately before publishing.',
      'No switch, stage, commit, merge, reset, push or deployment is performed.',
    ],
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2)
    if (args.some(arg => !['--fetch', '--check'].includes(arg))) throw new Error('Usage: node scripts/git-preflight.mjs [--fetch] [--check]')
    const result = inspectRepository({ fetch: args.includes('--fetch') })
    console.log(JSON.stringify(result, null, 2))
    if (args.includes('--check') && result.blockers.length) process.exitCode = 1
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}
