YUTUB
============

Simple youtube mp3 downloader and streamer written with node.js


Installation
---------------

* Download the repository
* Go to the repository folder with terminal
* Install the required dependencies `npm install`
* Start the server using `node .`
* Now you are ready to fly

Requirements
----------------

It uses lovely [youtube-dl software](https://github.com/rg3/youtube-dl) with [node-youtube-dl api](https://github.com/przemyslawpluta/node-youtube-dl).

Also you need ffprobe for webm to mp3 conversation.

Or you can use docker image co3moz/yutub (screw installation)

Usage
---------------

http://__localhost:6060_/_yca6UsllwYs_
Streams "Daft Punk - Around The World"

http://__localhost:6060_/_yca6UsllwYs_/dl
Downloads "Daft Punk - Around The World.mp3"

