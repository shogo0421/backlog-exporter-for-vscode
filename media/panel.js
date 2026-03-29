const vscode = acquireVsCodeApi()

function send(command) {
  vscode.postMessage({command})
}

const allBtns = ['btn-all', 'btn-issues', 'btn-wiki', 'btn-docs', 'btn-update']
const spinMap = {
  exportAll: 'spin-all',
  exportIssues: 'spin-issues',
  exportWiki: 'spin-wiki',
  exportDocuments: 'spin-docs',
  update: 'spin-update',
}

let currentCommand = null

function setRunning(running, cmd) {
  currentCommand = running ? cmd : null
  allBtns.forEach((id) => {
    document.getElementById(id).disabled = running
  })
  Object.entries(spinMap).forEach(([c, spinId]) => {
    document.getElementById(spinId).style.display = running && c === cmd ? 'block' : 'none'
  })
}

window.addEventListener('message', (event) => {
  const msg = event.data
  const dot = document.getElementById('status-dot')
  const text = document.getElementById('status-text')

  switch (msg.type) {
    case 'config': {
      const domainEl = document.getElementById('val-domain')
      const projectEl = document.getElementById('val-project')
      const outputEl = document.getElementById('val-output')
      domainEl.textContent = msg.domain || '未設定'
      domainEl.className = 'config-value' + (msg.domain ? '' : ' empty')
      projectEl.textContent = msg.project || '未設定'
      projectEl.className = 'config-value' + (msg.project ? '' : ' empty')
      outputEl.textContent = msg.outputDirectory || 'backlog-data'
      break
    }

    case 'running':
      if (msg.value) {
        dot.className = 'status-dot running'
        text.textContent = '実行中...'
      } else {
        dot.className = 'status-dot'
        text.textContent = '待機中'
      }
      setRunning(msg.value, currentCommand)
      break

    case 'log':
      dot.className = 'status-dot running'
      text.textContent = msg.text
      break

    case 'done':
      dot.className = 'status-dot done'
      text.textContent = msg.text
      break

    case 'error':
      dot.className = 'status-dot error'
      text.textContent = msg.text
      break

    case 'apiKey': {
      const apikeyEl = document.getElementById('val-apikey')
      const toggleBtn = document.getElementById('btn-toggle-apikey')
      if (msg.visible) {
        apikeyEl.textContent = msg.value || '(未設定)'
        toggleBtn.innerHTML = '<i class="codicon codicon-eye-closed"></i>'
        toggleBtn.title = '非表示にする'
      } else {
        apikeyEl.textContent = '••••••••'
        toggleBtn.innerHTML = '<i class="codicon codicon-eye"></i>'
        toggleBtn.title = '表示する'
      }
      break
    }
  }
})

document.getElementById('btn-all').addEventListener('click', () => {
  currentCommand = 'exportAll'
})
document.getElementById('btn-issues').addEventListener('click', () => {
  currentCommand = 'exportIssues'
})
document.getElementById('btn-wiki').addEventListener('click', () => {
  currentCommand = 'exportWiki'
})
document.getElementById('btn-docs').addEventListener('click', () => {
  currentCommand = 'exportDocuments'
})
document.getElementById('btn-update').addEventListener('click', () => {
  currentCommand = 'update'
})
