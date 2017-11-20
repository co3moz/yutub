const express = require('express');
const youtubeDL = require('youtube-dl');
const fs = require('fs');
const path = require('path');

const app = express();

const musicFolder = path.resolve(__dirname, './music/');
const ytdlFolderPattern = './music/%(title)s-%(id)s.%(ext)s';
const stillLoading = {};
const errorOnLoading = {};


var readdirCache = null;
function fsReaddir(location, cb) {
  if (readdirCache == null || readdirCache.last < Date.now()) {
    fs.readdir(location, (err, files) => {
      if (err) {
        return cb(err, null);
      }

      readdirCache = {
        last: Date.now() + 1000, // only 1 sec
        value: files
      };

      cb(null, files);
    });
    return;
  }

  cb(null, readdirCache.value);
}

function checkFileExists(videoId) {
  return new Promise((resolve, reject) => {
    fsReaddir(musicFolder, (err, files) => {
      if (err) {
        return reject(null);
      }

      for (var file of files) {
        if (file.indexOf(videoId) != -1) {
          return resolve(file);
        }
      }

      return reject(null);
    });

  });
}


function finished(videoId, res, dl) {
  if (errorOnLoading[videoId]) {
    return res.json({
      error: true,
      info: errorOnLoading[videoId]
    });
  }

  fs.readdir(musicFolder, (err, files) => {
    for (var file of files) {
      if (file.indexOf(videoId) != -1) {
        sendSource(file, res, dl)
        break;
      }
    }
  });
}


function sendSource(file, res, dl) {
  let fileFullPath = path.resolve(musicFolder, file);
  if (dl) {
    let fileWithoutCode = file.substring(0, file.lastIndexOf('-')) + '.mp3';
    res.download(fileFullPath, fileWithoutCode);
  } else {
    res.sendFile(fileFullPath);
  }
}

async function downloadMusic(req, res, next) {
  if (req.path == '/favicon.ico') return next();

  const dl = req.path.indexOf('/dl') != -1;
  const videoId = dl ? req.path.substring(1, req.path.length - 3) : req.path.substring(1);

  if (stillLoading[videoId] == true) {
    var waitSequence = setInterval(function () {
      if (!stillLoading[videoId]) {
        clearInterval(waitSequence); // avoid infinite shit.
        finished(videoId, res, dl);
      }
    }, 1000);
    return;
  }

  try {
    let data = await checkFileExists(videoId);

    console.log('yeey there is a music file already', videoId, dl);
    sendSource(data, res, dl);
    return;
  } catch (e) {
    console.log('looks like this music doesn\'t exists');
  }


  stillLoading[videoId] = true;

  youtubeDL.exec('http://www.youtube.com/watch?v=' + videoId,
    ['-x', '--audio-format', 'mp3', '-o', ytdlFolderPattern, '--postprocessor-args', "-threads 4"],
    { cwd: __dirname }, function (err, data) {

      delete stillLoading[videoId];

      if (err) {
        errorOnLoading[videoId] = err.stack;

        return res.json({
          error: true,
          info: err.stack
        });
      }


      delete errorOnLoading[videoId];

      finished(videoId, res, dl);
    });

  console.log('i got the data', req.path, videoId, dl);
}



app.get('/archive', (req, res) => {
  fsReaddir(musicFolder, (err, files) => {
    if (err) {
      return res.json({
        error: true,
        info: err.stack
      });
    }

    res.json(files);
  })
});

app.get(/^\/([A-Za-z0-9\-_]{5,20})\/dl$/, downloadMusic);
app.get(/^\/([A-Za-z0-9\-_]{5,20})$/, downloadMusic);


app.all('*', (req, res) => {
  res.json({
    invalid: true
  });
})

app.listen(6060);

console.log('application started at 6060');