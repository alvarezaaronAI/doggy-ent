import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { execFileSync } from 'node:child_process'
import { inspectRepository } from './git-preflight.mjs'

function fixture(run) {
  const directory = mkdtempSync(join(tmpdir(), 'shop-git-test-'))
  const git = (...args) => execFileSync('git', [
    '-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid',
    '-c', 'commit.gpgsign=false', '-c', 'core.hooksPath=/dev/null', ...args,
  ], { cwd: directory, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()
  try {
    git('init', '-b', 'dev-main')
    git('commit', '--allow-empty', '-m', 'chore: fixture baseline')
    git('update-ref', 'refs/remotes/origin/dev-main', 'HEAD')
    git('update-ref', 'refs/remotes/origin/main', 'HEAD')
    git('switch', '-c', 'codex/feat/test')
    run(directory, git)
  } finally { rmSync(directory, { recursive: true, force: true }) }
}

test('clean unpublished task branch passes without mutating repository', () => fixture((cwd, git) => {
  const before = git('show-ref')
  const result = inspectRepository({ cwd })
  assert.deepEqual(result.blockers, [])
  assert.equal(result.upstream, null)
  assert.equal(result.fetchedNow, false)
  assert.equal(result.sameProductionTree, true)
  assert.equal(git('show-ref'), before)
}))

test('dirty filenames with spaces are detected and never staged', () => fixture((cwd, git) => {
  writeFileSync(join(cwd, 'my pending change.txt'), 'fixture')
  assert.equal(inspectRepository({ cwd }).dirty, true)
  assert.equal(git('diff', '--cached', '--name-only'), '')
}))

test('production/integration branches block starting edits', () => fixture((cwd, git) => {
  git('switch', 'dev-main')
  assert.match(inspectRepository({ cwd }).blockers.join(' '), /create a scoped task branch/)
}))

test('ahead and divergent histories are distinguished without resetting work', () => fixture((cwd, git) => {
  git('commit', '--allow-empty', '-m', 'feat: local fixture')
  assert.equal(inspectRepository({ cwd }).integration.ahead, 1)
  const head = git('rev-parse', 'HEAD')
  git('switch', 'dev-main')
  git('commit', '--allow-empty', '-m', 'fix: integration fixture')
  git('update-ref', 'refs/remotes/origin/dev-main', 'HEAD')
  git('switch', 'codex/feat/test')
  const result = inspectRepository({ cwd })
  assert.equal(result.integration.diverged, true)
  assert.equal(result.integration.behind, 1)
  assert.equal(git('rev-parse', 'HEAD'), head)
}))

test('sensitive staged filenames are reported without contents', () => fixture((cwd, git) => {
  writeFileSync(join(cwd, '.env.private'), 'SYNTHETIC_FIXTURE=never-print-this')
  git('add', '.env.private')
  const result = inspectRepository({ cwd })
  assert.equal(result.sensitivePathCount, 1)
  assert.equal(JSON.stringify(result).includes('never-print-this'), false)
}))

test('detached head and missing integration are explicit blockers', () => fixture((cwd, git) => {
  git('switch', '--detach')
  git('update-ref', '-d', 'refs/remotes/origin/dev-main')
  const result = inspectRepository({ cwd })
  assert.equal(result.branch, null)
  assert.equal(result.integration, null)
  assert.equal(result.blockers.length, 2)
}))

test('failed fresh audit never silently reports cached refs as current', () => fixture(cwd => {
  assert.throws(() => inspectRepository({ cwd, fetch: true }), /No origin remote/)
}))
