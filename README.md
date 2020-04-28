# Secret Hitler Pants

Secret Hitler Pants is a minimalistic implementation of the [Secret Hitler](https://secrethitler.com) social deduction game in TypeScript.

## Play it online

You can try it out now at [secret-hitler-pants.herokuapp.com](https://secret-hitler-pants.herokuapp.com/).  Keep in mind that there is no chat system, so you and your friends should set up a video chat or something on the side.

## Run your own server

To run your own server: install Node.js, clone this repo, and run:

~~~
npm install
npm build
npm start
~~~

The server will run on `localhost:1234` by default.  Make sure incoming connections are allowed through your firewall.

## Testing

~~~
npm run start:dev
~~~

will start the server in development mode.  To test connecting with multiple users, try creating multiple Chrome user profiles:

~~~
mkdir test
mkdir test/user-1
chrome.exe --user-data-dir=test/user-1
~~~

## Attribution

This work, "Secret Hitler Pants", is a derivative of <a href="https://www.secrethitler.com/">"Secret Hitler"</a> by Mike Boxleiter,
Tommy Maranges, Max Temkin, and Mac Schubert, used under <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/">CC BY-NC-SA 4.0</a>.
<br/>
"Secret Hitler Pants" is licensed under <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/">CC BY-NC-SA 4.0</a> by <a href="https://github.com/sbj42">James Clark</a>.

