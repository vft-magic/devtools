import tmagicDevToolsOptions from 'virtual:tmagic-devtools-options'
import { functions, setDevToolsClientUrl } from '@tmagic/devtools-core'
import { createRpcServer, devtools, setDevToolsEnv } from '@tmagic/devtools-kit'

function normalizeUrl(url) {
  return new URL(`${tmagicDevToolsOptions.base || '/'}${url}`, import.meta.url).toString()
}

const overlayDir = normalizeUrl(`@id/virtual:tmagic-devtools-path:overlay`)
const body = document.getElementsByTagName('body')[0]
const head = document.getElementsByTagName('head')[0]

setDevToolsEnv({
  vitePluginDetected: true,
})

const devtoolsClientUrl = normalizeUrl(`__devtools__/`)
setDevToolsClientUrl(devtoolsClientUrl)

devtools.init()

// create link stylesheet
const link = document.createElement('link')
link.rel = 'stylesheet'
link.href = `${overlayDir}/devtools-overlay.css`

// create script
const script = document.createElement('script')
script.src = `${overlayDir}/devtools-overlay.mjs`
script.type = 'module'

// append to head
head.appendChild(link)

// append to body
body.appendChild(script)

// Used in the browser extension
window.__TMAGIC_DEVTOOLS_VITE_PLUGIN_CLIENT_URL__ = `${window.location.origin}${devtoolsClientUrl}`

createRpcServer(functions, {
  preset: 'iframe',
})

createRpcServer(functions, {
  preset: 'broadcast',
})
