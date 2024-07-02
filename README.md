# ITQuizshow

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 18.0.2.

## Explanation of project

This project is a kahoot-style clone (but with identification instead of multiple choice) made with angular and firebase. This project is made to be used with the MMCL IT Quiz Show as an automated system to run the quiz automatically.

Currently this project features two sides and a login screen:
* A landing page, an about page, and a 404 page
* A login screen that players can log in from using a google or anonymous account
* A player side that can login join a game, answer questions and receive points
* A host side that can upload question sets, start a game, and manage a session.

### Uploading Question Sets

When uploading question sets, ensure that they follow the format of Question, Answer, Level (EASY, AVERAGE, DIFFICULT, CLINCHER), and CATEGORY to prevent any problems. If you have an excel spreadsheet, then extract the needed collumns with headers into a separate spreadsheet and save it as a `.csv` file. 

** Ensure that your csv has no extra blank lines. **

## Firebase Environment

You're going to have to create your own environment files within the environment folder. [Create a firebase application ](https://firebase.google.com/docs/web/setup?continue=https%3A%2F%2Ffirebase.google.com%2Flearn%2Fpathways%2Ffirebase-web%23article-https%3A%2F%2Ffirebase.google.com%2Fdocs%2Fweb%2Fsetup) and get the firebaseConfig variable from your firebase project settings, as well as setting up the emulators within the development environment. 

### Firebase Setup

When Setting up the project use `firebase init` and setup authentication, firestore, and storage.

### Emulators
This guide will help you by giving a step by step tutorial for setting up the emulator [ guide](https://firebase.google.com/docs/emulator-suite/install_and_configure). Setup your emulators the same way as you did for your actual firebase.

For local developnment you should type in `firebase emulators:start` before turning on your development server. Don't use `ng serve` without doing this as the two sides of the system are reliant on firebase functions for route guarding.

### Deploying to live server
Use `ng build [projectname] --production` then`firebase deploy` to deploy onto your firebase host. 

If deploying to own domain follow this [guide](https://firebase.google.com/docs/hosting/custom-domain).


## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
