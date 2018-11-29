# jest-resolve-bug

A reproduction for a bug found in the default `jest` resolver ([`jest-resolve`](https://github.com/facebook/jest/tree/master/packages/jest-resolve)).

## Reproduction steps

1. Clone down this repo
2. Delete the file `src/index.js`
3. Run the command `npm run test-bug`

The above run returns the following message:

```bash
No tests found related to files changed since last commit.
```

However, we can see that the only test file in the repo (`src/index.spec.js`) requires this file to run.

Running the command `npm test` fails as expected with the following message:

```bash
FAIL  src/index.spec.js
 ● Test suite failed to run

   Cannot find module './index' from 'index.spec.js'

   > 1 | const index = require("./index");
       | ^
     2 |
     3 | test("that index returns hello world", () => {
     4 |   expect(index()).toBe("hello world");

     at Resolver.resolveModule (node_modules/jest-resolve/build/index.js:221:17)
     at Object.<anonymous> (src/index.spec.js:1:1)

```

## Further debugging

At first I believed this was an issue to do with the `changedSince` command. Upon looking into how this CLI option operates (using the [`jest-changed-files` package](https://github.com/facebook/jest/tree/master/packages/jest-changed-files)), I ran the following command in a `node` repl in the root of the repo:

```js
require(`jest-changed-files`)
  .getChangedFilesForRoots([process.cwd()], {})
  .then(console.log);
```

and received the following output:

```bash
Promise {
  <pending>,
  domain:
   Domain {
     domain: null,
     _events:
      { removeListener: [Function: updateExceptionCapture],
        newListener: [Function: updateExceptionCapture],
        error: [Function: debugDomainError] },
     _eventsCount: 3,
     _maxListeners: undefined,
     members: [] } }
> { changedFiles:
   Set { '/Users/emilymcdonald/work/jest-resolve-bug/src/index.js' },
  repos:
   { git: Set { '/Users/emilymcdonald/work/jest-resolve-bug' },
     hg: Set {} } }
```

As can be seen above, the function correctly identifies that the file `src/index.js` has been modified (in this case, deleted). It is therefore the resolution process that is incorrectly not identifiying the need for `src/index.spec.js` to run.
