const getSortableName = specifier => specifier[!!specifier.imported ? 'imported' : 'local'].name.toLowerCase()
const getFirstSortableName = node => (node.specifiers.length > 0 ? getSortableName(node.specifiers[0]) : null)

module.exports = {
    rules: {
        'sort-imports': {
            meta: {
                type: 'suggestion',
                docs: {
                    description: 'enforce sorted import declarations within modules',
                    category: 'ECMAScript 6',
                    url: 'https://github.com/sergeyshpadyrev/eslint-plugin-beautiful-imports'
                },
                schema: [
                    {
                        type: 'object',
                        properties: {
                            allowSeparatedGroups: {
                                type: 'boolean',
                                default: false
                            }
                        },
                        additionalProperties: false
                    }
                ],
                fixable: 'code',
                messages: {
                    sortImportsAlphabetically: 'Imports should be sorted alphabetically.',
                    sortMembersAlphabetically:
                        "Member '{{memberName}}' of the import declaration should be sorted alphabetically.",
                    unexpectedSyntaxOrder: "Expected order: imports without variables, '*' imports, regular imports"
                }
            },

            create: context => {
                const configuration = context.options[0] || {}
                const sourceCode = context.getSourceCode()
                const allowSeparatedGroups = configuration.allowSeparatedGroups || false

                const getImportGroupIndex = node =>
                    node.specifiers.length === 0 ? 0 : node.specifiers[0].type === 'ImportNamespaceSpecifier' ? 1 : 2

                let previousDeclaration = null

                return {
                    ImportDeclaration: node => {
                        if (
                            allowSeparatedGroups &&
                            previousDeclaration &&
                            Math.max(node.loc.start.line - previousDeclaration.loc.end.line - 1, 0) > 0
                        )
                            previousDeclaration = null

                        if (previousDeclaration) {
                            const currentMemberSyntaxGroupIndex = getImportGroupIndex(node)
                            const previousMemberSyntaxGroupIndex = getImportGroupIndex(previousDeclaration)
                            const currentLocalMemberName = getFirstSortableName(node)
                            const previousLocalMemberName = getFirstSortableName(previousDeclaration)

                            if (currentMemberSyntaxGroupIndex !== previousMemberSyntaxGroupIndex) {
                                if (currentMemberSyntaxGroupIndex < previousMemberSyntaxGroupIndex)
                                    context.report({
                                        node,
                                        messageId: 'unexpectedSyntaxOrder'
                                    })
                            } else {
                                if (
                                    previousLocalMemberName &&
                                    currentLocalMemberName &&
                                    currentLocalMemberName < previousLocalMemberName
                                )
                                    context.report({
                                        node,
                                        messageId: 'sortImportsAlphabetically'
                                    })

                                if (
                                    node.specifiers.length === 0 &&
                                    previousDeclaration.specifiers.length === 0 &&
                                    node.source.value.toLowerCase() < previousDeclaration.source.value.toLowerCase()
                                )
                                    context.report({
                                        node,
                                        messageId: 'sortImportsAlphabetically'
                                    })
                            }
                        }

                        previousDeclaration = node

                        const importSpecifiers = node.specifiers.filter(
                            specifier => specifier.type === 'ImportSpecifier'
                        )

                        const firstUnsortedIndex = importSpecifiers
                            .map(getSortableName)
                            .findIndex((name, index, array) => array[index - 1] > name)

                        if (firstUnsortedIndex !== -1)
                            context.report({
                                node: importSpecifiers[firstUnsortedIndex],
                                messageId: 'sortMembersAlphabetically',
                                data: { memberName: importSpecifiers[firstUnsortedIndex].local.name },
                                fix: fixer => {
                                    if (
                                        importSpecifiers.some(
                                            specifier =>
                                                sourceCode.getCommentsBefore(specifier).length ||
                                                sourceCode.getCommentsAfter(specifier).length
                                        )
                                    )
                                        return null

                                    return fixer.replaceTextRange(
                                        [
                                            importSpecifiers[0].range[0],
                                            importSpecifiers[importSpecifiers.length - 1].range[1]
                                        ],
                                        importSpecifiers
                                            .slice()
                                            .sort((specifierA, specifierB) =>
                                                getSortableName(specifierA) > getSortableName(specifierB) ? 1 : -1
                                            )
                                            .reduce((sourceText, specifier, index) => {
                                                const textAfterSpecifier =
                                                    index === importSpecifiers.length - 1
                                                        ? ''
                                                        : sourceCode
                                                              .getText()
                                                              .slice(
                                                                  importSpecifiers[index].range[1],
                                                                  importSpecifiers[index + 1].range[0]
                                                              )

                                                return sourceText + sourceCode.getText(specifier) + textAfterSpecifier
                                            }, '')
                                    )
                                }
                            })
                    }
                }
            }
        }
    }
}
