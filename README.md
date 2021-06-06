## Point Browser Extension

**Getting Started**

```
npm install
```

**Scripts**

-   `npm run dev` - run `webpack` in `watch` mode
-   `npm storybook` - runs the Storybook server
-   `npm build` - builds the production-ready unpacked extension
-   `npm test -u` - runs Jest + updates test snapshots
-   `npm lint` - runs EsLint
-   `npm prettify` - runs Prettier

In Mozilla Firefox, open up the `about:debugging#/runtime/this-firefox` page. Select `Load Temporary Add-on...` button and choose the `manfiest.json` from the `dist` directory in this repository - the extension should now be pinned to the task bar.
