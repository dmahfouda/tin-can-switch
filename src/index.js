var express = require('express')
var app = express()
var http = require('http').Server(app)
var io = require('socket.io')(http)
var fs = require('fs')
var Lame = require('node-lame').Lame;
var stream = require('stream');


app.use(express.static('build'))

const mongoose = require('mongoose')
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cans')

let db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', function(callback) {
  console.log('database connected')
  mongoose.connection.db.listCollections().toArray((err, names) => {
    console.log(`collection names: ${names}`); // [{ name: 'dbname.myCollection' }]
  })
})

let canSchema = new mongoose.Schema({
  canName: String,
  messages: Array
})

let pairs = {
  '::ffff:192.168.1.6': '::ffff:192.168.1.7',
  '::ffff:192.168.1.7': '::ffff:192.168.1.6'
}

// let canPairSchema = new mongoose.Schema({
//   can1: String,
//   can2: String
// }, {collection :'canPairs'})

let Can = mongoose.model('Can', canSchema)
// let CanPairs = mongoose.model('canPair', canPairSchema, 'canPairs')

// CanPairs.find({}, (err, data) => {
//   if (!err) {
//     console.log(`data: ${data.json}`)
//   }
// })

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
        console.log(error)
      });
    }
  });
});

var client;

io.on('connection', function(socket){
  console.log('a user connected');
  let address = socket.handshake.address
  console.log(`new ip address: ${address}`)
  Can.find( {canName:address}, (err, cans) => {
    console.log(`cans1: ${cans}`)
    if (err) {
      return console.error(err)
    } else {
      if (cans.length == 0) {
        console.log('no can in database')
        console.log(cans)
        let can = new Can({canName:address})
        can.save( err => {
            if (err) {
              console.log(err)
            } else {
              console.log('we think we saved it')
              socket.emit('messagelength', cans[0].messages.length)
            }
          })
      } else {
        socket.emit('messagelength', cans[0].messages.length)
        console.log('this is where we will send back can state from server')
        console.log(`cans: ${cans}`)
      }
    }
  })

  socket.on('messageType', (msg) => {
    var data = new Uint8Array(msg.sample);
    if (client) {
      client.emit('audio', data)
    }
    // player.feed(data);
  })

  // socket.on('incomingMessage', (msg) => {
  //   console.log(`msg: ${msg}`)
  //   Can.update({canName:pairs[address]}, {messages:[msg]}, (err, raw) => {
  //     // console.log(`cans2: ${cans}`)
  //     if (!err) {
  //       // cans.messages.push(msg.message)
  //       // cans.save(err => {
  //       //   if (!err) {
  //       //     console.log('we think we saved a message')
  //       //   }
  //       // })
  //       console.log(raw)
  //     }
  //     // else {
  //       // console.log('no find error')
  //     // }
  //   })
  // })

  // socket.send('hello')
	socket.on('disconnect', function(){
		console.log('disconnected: ' + socket.id);
	})

    // socket.send('hello')
  socket.on('audioMessage', function(message){
    console.log("audio message from: "+address)
    Can.updateOne({canName:pairs[address]}, {$push:{messages:[message]}}, (err, raw) => {
      if (!err) {
        console.log(message["sample"])
      } else {
        console.log(error);
      }
    })
  })

  socket.on('chat message', function(msg){
    // console.log('message: ' + msg);
    io.send(msg)
  })

  socket.on('register', () => {
    console.log('registered');
    client = socket.conn
    // socket.emit('ack')
  })

  //ping();
})



// io.on('connect_error', function(connect_error){
//   console.log('a user tried to connect');
//   console.log(connect_error)
// });

const ping = () => {
	console.log('led_on_before')
	io.send('led_on')
	console.log('led_on_after')
}

// setInterval(ping, 5000)

http.listen(3000, function(){
  console.log('listening on *:3000');
});
