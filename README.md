# Quando - Visual Programming for Digital Interactive Exhibits

## To Deploy in Windows - tested with Windows 10 Pro

Prerequisites: Chrome browser, Node JS, (optional) git for windows install (https://gitforwindows.org/)

1. Download the zip and extract into C:\quando, or Clone the repository in C: using git clone https://github.com/andrewfstratton/quando.git
2. In the command line, in C:\quando, npm update - this will likely take a while
3. You may see errors installing/building serialport - this should only happen with 'obscure' operating systems, e.g. non x64 windows.  The only missing feature will be (currently) USB micro:bit access - if you need this, then follow the relevant guide at https://serialport.io/docs/en/guide-installation
  * Note: You may need to install windows developer tools - run an admin shell, then 'npm install -g windows-build-tools'

### Setting up Quando for first time use

1. Run quando (which runs node app.js)
2. Open (in a browser) the url 'http://127.0.0.1:5984/_utils'
    1. Create a database called 'user' (top right)
    2. Click the '+' to the right of All Documents
    3. Choose '+ New Doc'
    4. Ctrl-A -> Delete, then paste the next line in:
        1. {"_id": "test", "password": "test"}
    5. Then choose 'Create Document'
3. Chrome needs to be modified to allow video and audio to auto play:
    1. _open chrome://flags/#autoplay-policy_
    2. _change to 'no user gesture is required'_
4. Then open 127.0.0.1/inventor, login as test/test

### To add automatic Windows *Server* startup - for deployed use - not for development
1. using Windows R, run gpedit.msc
2. Choose Computer Configuration->Windows Settings->Scripts->Startup
    1. Then 'Add' C:\quando\quando.bat
    2. (optional) follow the next instructions for Client browser setup - *(where you have a client display running on the server as well)*
### Client browser setup
The following setup can be done (by itself) on any client machine - though kiosk.bat will need to be copied over

1. Configure Chrome to allow auto play of audio and video
    * open chrome://flags/#autoplay-policy
    * change to 'no user gesture is required'
2. (if necessary) Edit the kiosk.bat file to change the location of Chrome
3. Then 
  * Either change the location of the chrome user data folder
  * Or create a folder c:\quando\chrome_user
  * Or remove the --user-data-dir xxx from the file
4. Save and Run quando\kiosk.bat
5. Then choose the interaction you want to automatically load on booting.
6. You can right click the screen to go back to the client setup.
7. using Windows R, run gpedit.msc
    * Choose Computer Configuration->Windows Settings->Scripts->Startup
    * Then 'Add' C:\quando\kiosk.bat to autostart Chrome

If everything is fine - then try restarting to see if everything boots correctly.

### Optional - Leap Motion
The standard Leap Motion (Orion) software needs to be installed on the Client PC, i.e. where the Leap motion is plugged in and where the browser will be run. The SDK is not needed.

Optional - npm install -g nodemon

### Updating using Git
To update (assuming quando has changed), First kill the Node.js process in the task manager,
then use:

* git pull origin master
* quando

## Editing as a Developer

The instructions below assume that you are using Visual Studio Code, though specifics are generally avoided.

You should run the pouchdb daemon, which is called 'pouchd', NOT 'pouchd**b**' 

Run the editor, then:
1. Run the pouchdb database, using `npm run pouchd`, e.g. from the terminal
2. Run `node app.js`, e.g. through Launch, (or npm run quando)
3. Open a Browser to 127.0.0.1/inventor

To use a client, access 127.0.0.1/client from a browser. This will automatically re-open the last script. You can right click the display to go to a screen that allows you to select already deployed/created scripts - whichever one you open will be reopened next time you open 127.0.0.1/client.

### Block Development

[Block Development](inventor/README.md)