# example

## Getting Started

```bash
npm install
```

for iOS:

```bash
npx pod-install
```

To run the app use:

```bash
run run ios
```

or

```bash
npm run android
```

## Updating project

1. Check if there are major versions of 3rd party dependencies, update and commit these changes first
2. Remove current `example` project
3. Create a project named `example` using [react-native-better-template](https://github.com/demchenkoalex/react-native-better-template)
4. Revert `README.md` so you can see this guide
5. In `tsconfig.json` add

```json
"baseUrl": ".",
"paths": {
  "@flyerhq/react-native-chat-ui": ["../src"]
},
"resolveJsonModule": true,
```

6. In `package.json` scripts section add

```json
"generate-messages": "node scripts/generateMessages.js",
"prepare": "npm run generate-messages",
```

7. Check the difference in `metro.config.js` and combine all
8. Revert `src` folder
9. Revert `scripts` folder
10. Revert `index.js`
11. Check the difference in `.gitignore` and combine all
12. Check the difference in `.eslintrc.js` and combine all
13. Install all missing dependencies
14. Check the difference in `Info.plist` and combine all
15. Open Xcode and change build number from 1 to 2 and back in the UI, so Xcode will format `*.pbxproj` eliminating some changes
