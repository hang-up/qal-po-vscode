const { window } = require('vscode');
const { completionProvider } = require('./providers/completion-provider');

const activate  = context => {
  window.showInformationMessage('QAL/acc page object resolver enabled');
  context.subscriptions.push(completionProvider);
};

const deactivate = () => {};

module.exports = {
  activate,
  deactivate
};