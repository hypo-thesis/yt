import fs from 'fs'
import ytdl from 'ytdl-core'
import ffmpeg from 'ffmpeg-static'
// import readline from 'readline'
import cp from 'child_process'
import Websocket from 'ws'

const wss = new Websocket.Server({ port: 8082 })
let audioConv
let videoConv
let t
let status = 'not done'
let fileName

export default async (url) => {
  console.log(url)
  wss.on('connection', ws => {
    console.log('user is connected to the server #mainpage')

    t = setInterval(() => {
      ws.send(JSON.stringify({
        percentage: videoConv,
        status: status,
        fileName : fileName
      }))
      if (status === 'done') {
        clearInterval(t)
        ws.close()
      }
    }, 333);

  })
  
  wss.on('close', ws => {
    ws.send('connection close')
  })


  const tracker = {
    start: Date.now(),
    audio: { downloaded: 0, total: Infinity },
    video: { downloaded: 0, total: Infinity },
  };
  const info = await ytdl.getInfo(url)
  //  .then(info => {
  // console.log('title:', info.videoDetails.title)
  // console.log('rating:', info.player_response.videoDetails.averageRating)
  // console.log('uploaded by:', info.videoDetails.author.name)

  //    info.videoDetails.title
  // })
  // Get audio and video stream going
  const audio = ytdl(url, { filter: 'audioonly', quality: 'highestaudio' })
    .on('progress', (_, downloaded, total) => {
      tracker.audio = { downloaded, total };
    });
  const video = ytdl(url, { filter: 'videoonly', quality: 'highestvideo' })
    .on('progress', (_, downloaded, total) => {
      tracker.video = { downloaded, total };
    });


  const progressbar = setInterval(() => {

    // readline.cursorTo(process.stdout, 0);
    // const toMB = i => (i / 1024 / 1024).toFixed(2);
    // // audioConv = (tracker.audio.downloaded / tracker.audio.total * 100).toFixed(2)
    videoConv = (tracker.video.downloaded / tracker.video.total * 100).toFixed(2)

    // process.stdout.write(`Audio | ${(tracker.audio.downloaded / tracker.audio.total * 100).toFixed(2)}% processed `);
    // process.stdout.write(`(${toMB(tracker.audio.downloaded)}MB of ${toMB(tracker.audio.total)}MB).${' '.repeat(10)}\n`);

    // process.stdout.write(`Video | ${(tracker.video.downloaded / tracker.video.total * 100).toFixed(2)}% processed `);
    // process.stdout.write(`(${toMB(tracker.video.downloaded)}MB of ${toMB(tracker.video.total)}MB).${' '.repeat(10)}\n`);

    // process.stdout.write(`running for: ${((Date.now() - tracker.start) / 1000 / 60).toFixed(2)} Minutes.`);
    // readline.moveCursor(process.stdout, 0, -2);
  }, 555);


  const ffmpegProcess = cp.spawn(ffmpeg, [
    // Remove ffmpeg's console spamming
    '-loglevel', '0', '-hide_banner',
    // Redirect/enable progress messages
    '-progress', 'pipe:3',
    // 3 second audio offset
    '-itsoffset', '3.0', '-i', 'pipe:4',
    '-i', 'pipe:5',
    // Rescale the video
    // '-vf', 'scale=1920:1080',
    // Choose some fancy codes
    // '-c:v', 'libx265', '-x265-params', 'log-level=0',
    '-c', 'copy',
    '-c:a', 'flac',
    // Define output container
    '-f', 'matroska', 'pipe:6',
  ], {
    windowsHide: true,
    stdio: [
      /* Standard: stdin, stdout, stderr */
      'inherit', 'inherit', 'inherit',
      /* Custom: pipe:3, pipe:4, pipe:5, pipe:6 */
      'pipe', 'pipe', 'pipe', 'pipe',
    ],
  });
  ffmpegProcess.on('close', () => {
    // process.stdout.write('\n\n\n');
    status = 'done'
    clearInterval(progressbar);
    console.log('done');

    // clearInterval(t)
  });



  fileName = info.videoDetails.title.replace(/[\/|\\:*?"<>.#|]/g, " ")

  console.log(fileName)
  audio.pipe(ffmpegProcess.stdio[4]);
  video.pipe(ffmpegProcess.stdio[5]);
  ffmpegProcess.stdio[6].pipe(fs.createWriteStream(`./dl/${fileName}.mp4`))
}






