const sortImports = require('./index').rules['sort-imports']
const RuleTester = require('eslint').RuleTester

const ruleTester = new RuleTester({
    parser: require('babel-eslint'),
    parserOptions: { ecmaVersion: 7, sourceType: 'module' }
})
const errors = {
    sortImportsAlphabetically: { messageId: 'sortImportsAlphabetically' }
}

ruleTester.run('sort-imports', sortImports, {
    valid: [
        {
            code: `
                import a from 'a'
                import b from 'b'
            `
        }
    ],
    invalid: [
        {
            code: `
            import b from 'b'
            import a from 'a'
        `,
            errors: [errors.sortImportsAlphabetically]
        }
    ]
})
