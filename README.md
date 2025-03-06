# AVGearCSK44
Simple TCP command sender written in node.js with a js frontend
especially for those occasions where you cant be arsed logging into the site or picking up a remote

**this will work on any device which receives commands over a tcp port, with a big of config - the server.js file has the commands - start there**

to use:
#install node js with npm

$sudo apt update && sudo apt install -y nodejs npm


start the server with

$node server.js

For those of you who enjoy unecessary complexity in their lives, why not build a docker container and make it deployable anywhere?

docker build -t hdmi-switcher .
docker run -d -p 3000:3000 --name hdmi-switcher hdmi-switcher
