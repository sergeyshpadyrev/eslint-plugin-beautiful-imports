const sortImports = require('./index').rules['sort-imports']
const RuleTester = require('eslint').RuleTester

const ruleTester = new RuleTester({
    parser: require('babel-eslint'),
    parserOptions: { ecmaVersion: 7, sourceType: 'module' }
})
const errors = {
    sortImportsAlphabetically: { messageId: 'sortImportsAlphabetically' },
    sortMembersAlphabetically: { messageId: 'sortMembersAlphabetically' },
    unexpectedSyntaxOrder: { messageId: 'unexpectedSyntaxOrder' }
}

// TODO add tests for * as name
// TODO add tests for a as name
// TODO add tests for {a as name}
// TODO add tests for {b, a as name}
// TODO add tests for a as C before b as D

ruleTester.run('sort-imports', sortImports, {
    valid: [
        {
            code: `
                import a from 'a'
                import b from 'b'
            `
        },
        {
            code: `
                import { a } from 'a'
                import { b } from 'b'
            `
        },
        {
            code: `
                import { a } from 'a'
                import b from 'b'
            `
        },
        {
            code: `
                import { a, b } from 'a'
            `
        },
        {
            code: `
                import 'a'
                import b from 'b'
            `
        },
        {
            code: `
                import 'a'
                import 'b'
            `
        },
        {
            code: `
                import 'a'
                import * as b from 'b'
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
        },
        {
            code: `
                import { b } from 'b'
                import { a } from 'a'
            `,
            errors: [errors.sortImportsAlphabetically]
        },
        {
            code: `
                import b from 'b'
                import { a } from 'a'
            `,
            errors: [errors.sortImportsAlphabetically]
        },
        {
            code: `
                import { b, a } from 'a'
            `,
            output: `
                import { a, b } from 'a'
            `,
            errors: [errors.sortMembersAlphabetically]
        },
        {
            code: `
                import b from 'b'
                import 'a'
            `,
            errors: [errors.unexpectedSyntaxOrder]
        },
        {
            code: `
                import 'b'
                import 'a'
            `,
            errors: [errors.sortImportsAlphabetically]
        },
        {
            code: `
                import * as b from 'b'
                import 'a'
            `,
            errors: [errors.unexpectedSyntaxOrder]
        }
    ]
})
