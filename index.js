// Based on eslint/sort-imports

module.exports = {
  rules: {
    "sort-imports": {
      meta: {
        type: "suggestion",

        docs: {
          description: "enforce sorted import declarations within modules",
          category: "ECMAScript 6",
          recommended: false,
          url: "https://eslint.org/docs/rules/sort-imports",
        },

        schema: [
          {
            type: "object",
            properties: {
              allowSeparatedGroups: {
                type: "boolean",
                default: false,
              },
            },
            additionalProperties: false,
          },
        ],

        fixable: "code",

        messages: {
          sortImportsAlphabetically: "Imports should be sorted alphabetically.",
          sortMembersAlphabetically:
            "Member '{{memberName}}' of the import declaration should be sorted alphabetically.",
          unexpectedSyntaxOrder:
            "Expected imports without variables to be on the top.",
        },
      },

      create(context) {
        const configuration = context.options[0] || {},
          allowSeparatedGroups = configuration.allowSeparatedGroups || false,
          sourceCode = context.getSourceCode();
        let previousDeclaration = null;

        /**
         * Gets the group by member parameter index for given declaration.
         * @param {ASTNode} node the ImportDeclaration node.
         * @returns {number} the declaration group by member index.
         */
        function getMemberParameterGroupIndex(node) {
          return node.specifiers.length === 0 ? 0 : 1;
        }

        /**
         * Gets the local name of the first imported module.
         * @param {ASTNode} node the ImportDeclaration node.
         * @returns {?string} the local name of the first imported module.
         */
        function getFirstLocalMemberName(node) {
          if (node.specifiers[0]) {
            return node.specifiers[0].local.name;
          }
          return null;
        }

        /**
         * Calculates number of lines between two nodes. It is assumed that the given `left` node appears before
         * the given `right` node in the source code. Lines are counted from the end of the `left` node till the
         * start of the `right` node. If the given nodes are on the same line, it returns `0`, same as if they were
         * on two consecutive lines.
         * @param {ASTNode} left node that appears before the given `right` node.
         * @param {ASTNode} right node that appears after the given `left` node.
         * @returns {number} number of lines between nodes.
         */
        function getNumberOfLinesBetween(left, right) {
          return Math.max(right.loc.start.line - left.loc.end.line - 1, 0);
        }

        return {
          ImportDeclaration(node) {
            if (
              previousDeclaration &&
              allowSeparatedGroups &&
              getNumberOfLinesBetween(previousDeclaration, node) > 0
            ) {
              // reset declaration sort
              previousDeclaration = null;
            }

            if (previousDeclaration) {
              const currentMemberSyntaxGroupIndex = getMemberParameterGroupIndex(
                  node
                ),
                previousMemberSyntaxGroupIndex = getMemberParameterGroupIndex(
                  previousDeclaration
                );
              let currentLocalMemberName = getFirstLocalMemberName(node),
                previousLocalMemberName = getFirstLocalMemberName(
                  previousDeclaration
                );

              previousLocalMemberName =
                previousLocalMemberName &&
                previousLocalMemberName.toLowerCase();
              currentLocalMemberName =
                currentLocalMemberName && currentLocalMemberName.toLowerCase();

              /*
               * When the current declaration uses a different member syntax,
               * then check if the ordering is correct.
               * Otherwise, make a default string compare (like rule sort-vars to be consistent) of the first used local member name.
               */
              if (
                currentMemberSyntaxGroupIndex !== previousMemberSyntaxGroupIndex
              ) {
                if (
                  currentMemberSyntaxGroupIndex < previousMemberSyntaxGroupIndex
                ) {
                  context.report({
                    node,
                    messageId: "unexpectedSyntaxOrder",
                  });
                }
              } else {
                if (
                  previousLocalMemberName &&
                  currentLocalMemberName &&
                  currentLocalMemberName < previousLocalMemberName
                ) {
                  context.report({
                    node,
                    messageId: "sortImportsAlphabetically",
                  });
                }

                if (
                  node.specifiers.length === 0 &&
                  previousDeclaration.specifiers.length === 0 &&
                  node.source.value.toLowerCase() <
                    previousDeclaration.source.value.toLowerCase()
                ) {
                  context.report({
                    node,
                    messageId: "sortImportsAlphabetically",
                  });
                }
              }
            }

            previousDeclaration = node;

            const importSpecifiers = node.specifiers.filter(
              (specifier) => specifier.type === "ImportSpecifier"
            );
            const getSortableName = (specifier) =>
              specifier.local.name.toLowerCase();
            const firstUnsortedIndex = importSpecifiers
              .map(getSortableName)
              .findIndex((name, index, array) => array[index - 1] > name);

            if (firstUnsortedIndex !== -1) {
              context.report({
                node: importSpecifiers[firstUnsortedIndex],
                messageId: "sortMembersAlphabetically",
                data: {
                  memberName: importSpecifiers[firstUnsortedIndex].local.name,
                },
                fix(fixer) {
                  if (
                    importSpecifiers.some(
                      (specifier) =>
                        sourceCode.getCommentsBefore(specifier).length ||
                        sourceCode.getCommentsAfter(specifier).length
                    )
                  ) {
                    // If there are comments in the ImportSpecifier list, don't rearrange the specifiers.
                    return null;
                  }

                  return fixer.replaceTextRange(
                    [
                      importSpecifiers[0].range[0],
                      importSpecifiers[importSpecifiers.length - 1].range[1],
                    ],
                    importSpecifiers

                      // Clone the importSpecifiers array to avoid mutating it
                      .slice()

                      // Sort the array into the desired order
                      .sort((specifierA, specifierB) => {
                        const aName = getSortableName(specifierA);
                        const bName = getSortableName(specifierB);

                        return aName > bName ? 1 : -1;
                      })

                      // Build a string out of the sorted list of import specifiers and the text between the originals
                      .reduce((sourceText, specifier, index) => {
                        const textAfterSpecifier =
                          index === importSpecifiers.length - 1
                            ? ""
                            : sourceCode
                                .getText()
                                .slice(
                                  importSpecifiers[index].range[1],
                                  importSpecifiers[index + 1].range[0]
                                );

                        return (
                          sourceText +
                          sourceCode.getText(specifier) +
                          textAfterSpecifier
                        );
                      }, "")
                  );
                },
              });
            }
          },
        };
      },
    },
  },
};
