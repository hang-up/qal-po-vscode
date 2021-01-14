const {
  languages,
  CompletionItem,
  workspace,
} = require('vscode');
const { parse } = require('@babel/parser');
const { extractKeys } = require('../ast/extract-keys');

/**
 * Page objects completion provider.
 * Triggered everytime an autocomplete window opens.
 * 
 * The flow to expose the right po keys is as follow:
 * - Get all references to imported page objects in the opened file.
 * - Prepend/Append these refs with __ (by PO convention)
 * - When a triggering token is received (.), validate if the token presents one of the PO refs.
 * - Dynamically load the PO content
 * - Create a dynamic AST to extract all PO keys
 * - Returns these values.
 */
const completionProvider = languages.registerCompletionItemProvider(
  'javascript',
  {

    /**
     * ENTRY POINT
     * Provide a list of completion items.
     * 
     * @param {import('vscode').TextDocument} document 
     * @param {import('vscode').Position} position 
     */
    async provideCompletionItems(document, position) {
      let extractedKeys = [];

      /**
       * Get the page objects references for the currently opened document.
       * 
       * @param {string} documentText Content of opened document
       */
      const getObjectRefs = (documentText) => {
        /*
          Get the lines that contain ./objects/** and eturns the __camelcased__ version of the
          filename (by convention).
          TODO: Allow dynamic parameter of the page object folder.
        */
        return documentText.split('\n').filter(line => {
          return ['{', '}', 'objects/'].every(token => line.includes(token)) && !line.includes('composite');
        }).map(imports => {
          // Base path where the extension is called from.
          const basePath = workspace.workspaceFolders && workspace.workspaceFolders[0].uri.fsPath;
          const kebabCasedImportToken = imports.substring(imports.lastIndexOf('/') + 1, imports.length - 2);
          const camelCasedimportToken = kebabCasedImportToken.replace(/-./g, x => x.toUpperCase()[1]);

          return {
            module: `__${camelCasedimportToken}__`,
            importName: `${camelCasedimportToken.charAt(0).toUpperCase()}${camelCasedimportToken.slice(1)}`,
            path: `${basePath}/objects/${kebabCasedImportToken}.js`
          };
        });
      };

      /**
       * Convert an array of page object references to an object in the format of 
       * { [pageObjectName]: {...content} }.
       * 
       * @param {*} modules Array of page objects
       */
      const refsToObject = (modules) => {
        return modules.reduce((carry, current) => {
          carry[current['importName']] = current;
          return carry;
        }, {});
      };

      /**
       * Validates if the triggering token is a page object.
       * 
       * @param {string} token Triggering token
       */
      const endsWithAnyRefs = (token) => {
        return getObjectRefs(document.getText()).map(ref => ref.importName).some(suffix => token.endsWith(`${suffix}`));
      };

      // TODO: This won't work if there is not a space in front of the token!
      const lineTokens = document.lineAt(position).text.substr(0, position.character - 1).split(' ');
      const linePrefix = lineTokens[lineTokens.length - 1];

      const refs = getObjectRefs(document.getText());
      const objRefs = refsToObject(refs);

      if (!endsWithAnyRefs(linePrefix)) {
        return undefined;
      }

      await workspace.openTextDocument(objRefs[linePrefix].path).then(document => {
        const rawAst = parse(document.getText(), {
          sourceType: "module"
        });
        extractedKeys = (extractKeys(rawAst, objRefs[linePrefix].module));
      });

      return extractedKeys.sort((a, b) => a.value - b.value).map(k => {
        return new CompletionItem(k.value, k.type);
      });
    }
  },
  '.' // triggered whenever a '.' is being typed
);

module.exports = { completionProvider };