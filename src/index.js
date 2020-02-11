const express  = require('express');
const app      = express();
const http     = require('http').Server(app);
const io       = require('socket.io')(http);
const fs       = require('fs');
const Lame     = require('node-lame').Lame;
const stream   = require('stream');
const mongoose = require('mongoose')

mongoose.connect('mongodb://mongo:27017/cans', { 
  useNewUrlParser: true,
  useUnifiedTopology: true,
}, (err) => {
  if (err) {
    console.log('failed to connect to mongo database, exiting...');
    process.exit(1);
  } else {
    console.log('successfully connected to mongo database');
  }
});

mongoose.connection.on('error', 
  console.error.bind(console, 'connection error:')
);

const canSchema = new mongoose.Schema({
  canName: String,
  messages: Array
});

const Can = mongoose.model('Can', canSchema);

const pairs = {
  '::ffff:192.168.1.6': '::ffff:192.168.1.7',
  '::ffff:192.168.1.7': '::ffff:192.168.1.6'
};

app.get('/mp3', function(req, res) {
  let address = req.connection.remoteAddress;
  Can.find({ canName: address }, (err, cans) => {
    if(err) {
      console.log(error);
    } else if(cans.length == 0) {
      console.log(`no cans found with name: ${name}`);
    } else {
      let result = "";
      let can = cans[0];
      for(let i = 0; i < can.messages.length; i++) {
        result += can.messages[i].sample;
      }
      let buffer = new Buffer(result, 'base64');

      const encoder = new Lame({
        output: "buffer",
        raw: true,
        bitwidth: 8,
        mode: "m",
        sfreq: 8,
        bitrate: 40
      }).setBuffer(buffer);

      encoder.encode().then(() => {
        console.log("success encoded pcm data from mongodb");
        let result = encoder.getBuffer();

        res.status(206).header({
          'Content-Type': 'audio/mpeg',
          'Content-Length': result.length,
        });

        let readStream = new stream.PassThrough();
        readStream.end(result);
        readStream.pipe(res);
      }).catch(error => {
        console.log(error);
      });
    }
  });
});

io.on('connection', (socket) => {
  let address = socket.handshake.address;
  console.log(`connected: ${address}`);

  Can.find({ canName: address }, (err, cans) => {
    if (err) {
      console.error(err);
      return;
    }
    if (cans.length == 0) {
      let can = new Can({ canName: address });
      can.save((err) => {
        if (err) {
          console.log(err);
          return;
        }
        socket.emit('messagelength', 0);
      })
    } else {
      let can = can[0];
      socket.emit('messagelength', can.messages.length);
    }
  });

  socket.on('disconnect', function(){
    console.log(`disconnected: ${address}`);
  });

  socket.on('audioMessage', function(message){
    console.log(`audio message from: ${address}`);
    Can.updateOne({ canName: pairs[address] }, { $push: { messages: [message] }}, (err, raw) => {
      if (err) {
        console.log(error);
        return;
      }
    });
  });
});

const config = {
  host: '0.0.0.0',
  port: 8080,
};

http.listen(config, () => {
  console.log(`listening on ${config.host}:${config.port}`);
});
