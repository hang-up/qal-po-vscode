# QAL Page Object Visual Studio Code Extension

A highly experimental extension enabling code completion on page objects nested attributes.
In other words, suggest the right keys wrapped inside `literals`, `elements` and `actions`.

## Features

Suggest wrapped page objects keys when the name of a page object is identified.

\!\[Autocomplete\]\(images/suggestion.png\)

## Requirements

This extension is not published on the vscode marketplace. Instead, you can compile it and install the VSIX file locally.
Follow this link for a how to: https://code.visualstudio.com/api/working-with-extensions/publishing-extension#packaging-extensions 

## Extension Settings
> This section is a WIP. Among other things, we need to enable dynamic page object folders.

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

* `myExtension.enable`: enable/disable this extension
* `myExtension.thing`: set to `blah` to do something

## Known Issues

- No Go To Definition
- No Rich preview