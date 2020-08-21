module.exports = {
    rules: {
        'sort-imports': {
            meta: {
                type: 'suggestion',
                docs: {
                    description: 'enforce sorted import declarations within modules',
                    category: 'ECMAScript 6',
                    recommended: false,
                    url: 'https://eslint.org/docs/rules/sort-imports'
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

            create(context) {
                const configuration = context.options[0] || {},
                    allowSeparatedGroups = configuration.allowSeparatedGroups || false,
                    sourceCode = context.getSourceCode()
                let previousDeclaration = null

                function getMemberParameterGroupIndex(node) {
                    if (node.specifiers.length === 0) return 0
                    if (node.specifiers[0].type === 'ImportNamespaceSpecifier') return 1
                    return 2
                }

                function getFirstLocalMemberName(node) {
                    const specifier = node.specifiers[0]
                    if (!specifier) return null
                    if (!!specifier.imported) return specifier.imported.name
                    return specifier.local.name
                }

                function getNumberOfLinesBetween(left, right) {
                    return Math.max(right.loc.start.line - left.loc.end.line - 1, 0)
                }

                return {
                    ImportDeclaration(node) {
                        if (
                            previousDeclaration &&
                            allowSeparatedGroups &&
                            getNumberOfLinesBetween(previousDeclaration, node) > 0
                        ) {
                            previousDeclaration = null
                        }

                        if (previousDeclaration) {
                            const currentMemberSyntaxGroupIndex = getMemberParameterGroupIndex(node),
                                previousMemberSyntaxGroupIndex = getMemberParameterGroupIndex(previousDeclaration)
                            let currentLocalMemberName = getFirstLocalMemberName(node),
                                previousLocalMemberName = getFirstLocalMemberName(previousDeclaration)

                            previousLocalMemberName = previousLocalMemberName && previousLocalMemberName.toLowerCase()
                            currentLocalMemberName = currentLocalMemberName && currentLocalMemberName.toLowerCase()

                            if (currentMemberSyntaxGroupIndex !== previousMemberSyntaxGroupIndex) {
                                if (currentMemberSyntaxGroupIndex < previousMemberSyntaxGroupIndex) {
                                    context.report({
                                        node,
                                        messageId: 'unexpectedSyntaxOrder'
                                    })
                                }
                            } else {
                                if (
                                    previousLocalMemberName &&
                                    currentLocalMemberName &&
                                    currentLocalMemberName < previousLocalMemberName
                                ) {
                                    context.report({
                                        node,
                                        messageId: 'sortImportsAlphabetically'
                                    })
                                }

                                if (
                                    node.specifiers.length === 0 &&
                                    previousDeclaration.specifiers.length === 0 &&
                                    node.source.value.toLowerCase() < previousDeclaration.source.value.toLowerCase()
                                ) {
                                    context.report({
                                        node,
                                        messageId: 'sortImportsAlphabetically'
                                    })
                                }
                            }
                        }

                        previousDeclaration = node

                        const importSpecifiers = node.specifiers.filter(
                            specifier => specifier.type === 'ImportSpecifier'
                        )
                        const getSortableName = specifier => specifier.local.name.toLowerCase()
                        const firstUnsortedIndex = importSpecifiers
                            .map(getSortableName)
                            .findIndex((name, index, array) => array[index - 1] > name)

                        if (firstUnsortedIndex !== -1) {
                            context.report({
                                node: importSpecifiers[firstUnsortedIndex],
                                messageId: 'sortMembersAlphabetically',
                                data: {
                                    memberName: importSpecifiers[firstUnsortedIndex].local.name
                                },
                                fix(fixer) {
                                    if (
                                        importSpecifiers.some(
                                            specifier =>
                                                sourceCode.getCommentsBefore(specifier).length ||
                                                sourceCode.getCommentsAfter(specifier).length
                                        )
                                    ) {
                                        // If there are comments in the ImportSpecifier list, don't rearrange the specifiers.
                                        return null
                                    }

                                    return fixer.replaceTextRange(
                                        [
                                            importSpecifiers[0].range[0],
                                            importSpecifiers[importSpecifiers.length - 1].range[1]
                                        ],
                                        importSpecifiers

                                            // Clone the importSpecifiers array to avoid mutating it
                                            .slice()

                                            // Sort the array into the desired order
                                            .sort((specifierA, specifierB) => {
                                                const aName = getSortableName(specifierA)
                                                const bName = getSortableName(specifierB)

                                                return aName > bName ? 1 : -1
                                            })

                                            // Build a string out of the sorted list of import specifiers and the text between the originals
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
}
