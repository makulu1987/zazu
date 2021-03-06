'use strict'

const gulp = require('gulp')
const ghpages = require('gh-pages')
const path = require('path')
const fs = require('fs')
const { execSync } = require('child_process')

const appVersion = () => {
  const packageJson = path.join('app', 'package.json')
  const packageContent = JSON.parse(fs.readFileSync(packageJson))
  return packageContent.version
}

const commitSha = () => {
  return execSync('git rev-parse HEAD').toString()
}

const setupDynamicConfig = (docsConfigFile) => {
  fs.writeFileSync(docsConfigFile, `currentCommitSha: ${commitSha()}\n`, { flag: 'a' })
  fs.writeFileSync(docsConfigFile, `currentAppVersion: v${appVersion()}\n`, { flag: 'a' })
}

const cleanupDynamicConfig = (docsConfigFile) => {
  const data = fs.readFileSync(docsConfigFile)
  fs.writeFileSync(docsConfigFile, data.toString().split('\n').filter((line) => {
    return !line.match(/currentCommitSha|currentAppVersion/)
  }).join('\n').trim() + '\n')
}

gulp.task('ghpages', () => {
  const docsDirectory = path.join('docs')
  const docsConfigFile = path.join(docsDirectory, '_config.yml')
  setupDynamicConfig(docsConfigFile)
  ghpages.publish(docsDirectory, { dotfiles: true }, (err) => {
    console.log('err', err)
    cleanupDynamicConfig(docsConfigFile)
    console.log('Deployed documentation')
  })
})
