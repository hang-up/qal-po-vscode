const { CompletionItemKind } = require('vscode');

/**
 * Creates a dynamic AST based on the identified module name.
 * Extracts all the keys to expose them as tuple of shape 
 * { value: "Value to display in autocomplete list", type: CompletionItemKind }
 * 
 * @param {File} ast Page object AST
 * @param {string} module Page object module name
 */
const extractKeys = (ast, module) => {
  // Gets all the variable declarations. No specific reason, makes it easier to work with.
  const variableDeclarations = ast.program.body.filter(declaration => declaration.type === 'VariableDeclaration');

  // Gets the module node from the ast.
  const moduleNode = variableDeclarations.filter(variableDeclaration => variableDeclaration.declarations[0].id.name === module)[0];

  // Exposes all the keys from the ast node.
  const rawKeys = moduleNode.declarations[0].init.properties.map(prop => {
    if (prop.key.name === 'name') {
      return [{
        value: "name",
        type: CompletionItemKind.Field
      }];
    }

    return prop.value.properties.map(objectProperty => {
      return {
        keyName: objectProperty.key.name,
        keyTypeFromAst: objectProperty.type
      };
    }).map(({ keyName, keyTypeFromAst }) => ({
      value: keyName,
      type: keyTypeFromAst === 'ObjectProperty' ? CompletionItemKind.Field : CompletionItemKind.Method
    }));
  });
  // Flatten the final array.
  return [].concat.apply(this, rawKeys);
};

module.exports = { extractKeys };