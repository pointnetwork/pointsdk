## Point Browser Extension

**Getting Started**

```
npm install
```

**Scripts**

-   `npm run dev` - run `webpack` in `watch` mode
-   `npm run storybook` - runs the Storybook server
-   `npm run build` - builds the production-ready unpacked extension
-   `npm test -u` - runs Jest + updates test snapshots
-   `npm run lint` - runs EsLint
-   `npm run prettify` - runs Prettier

**Mozilla Firefox**

In Mozilla Firefox, open up the `about:debugging#/runtime/this-firefox` page. Select `Load Temporary Add-on...` button and choose the `manfiest.json` from the `dist` directory in this repository - the extension should now be pinned to the task bar.

**Google Chrome**

In Google Chrome, open up `chrome://extensions`. Make sure the Developer Mode checkbox in the upper-right corner is turned on. Click Load unpacked and select the dist directory in this repository - the extension should now be pinned to the task bar.

**Brave**

In Brave, open up `brave://extensions`. Make sure the Developer Mode checkbox in the upper-right corner is turned on. Click Load unpacked and select the dist directory in this repository - the extension should now be pinned to the task bar.

### Using web-ext

The `web-ext` command line tool can facilitate the development experience. This helps to streamline development and to automatically load the extention when Firefox starts as well as when the extention is updated.

First step is to instlal the `web-ext` utility globally like so:

```
npm install --global web-ext
```

Now you can start up Firefox using a specific Profile that you have already created (e.g. `website_owner` which has the proxy already configured for pointing to the `website_owner` node instance). Make sure to specify the source directory where the extentions built `manifiest.json` file is located. You can also optionally, provide a url of a website you want to open by default (e.g. `https://store.z/`).

```
web-ext run --firefox-profile=website_owner --source-dir dist/prod --url https://store.z/
```

Please check the Firefox docs more details on the [`web-ext` command line tool](https://extensionworkshop.com/documentation/develop/getting-started-with-web-ext/)

**NOTE: It appears the page will load BEFORE the extention so simply refersh the page on the first load!**