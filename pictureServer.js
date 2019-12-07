/*
server.js

Authors:David Goedicke (da.goedicke@gmail.com) & Nikolas Martelaro (nmartelaro@gmail.com)

This code is heavily based on Nikolas Martelaroes interaction-engine code (hence his authorship).
The  original purpose was:
This is the server that runs the web application and the serial
communication with the micro controller. Messaging to the micro controller is done
using serial. Messaging to the webapp is done using WebSocket.

//-- Additions:
This was extended by adding webcam functionality that takes images remotely.

Usage: node server.js SERIAL_PORT (Ex: node server.js /dev/ttyUSB0)

Notes: You will need to specify what port you would like the webapp to be
served from. You will also need to include the serial port address as a command
line input.
*/
var express = require('express'); // web server application
var app = express(); // webapp
var http = require('http').Server(app); // connects http library to server
var io = require('socket.io')(http); // connect websocket library to server
var serverPort = 8000;
var SerialPort = require('serialport'); // serial library
var Readline = SerialPort.parsers.Readline; // read serial data as lines
//-- Addition:
var NodeWebcam = require( "node-webcam" );// load the webcam module
const vision = require('@google-cloud/vision'); // google vision package
// Creates a client
const client = new vision.ImageAnnotatorClient();;
//---------------------- WEBAPP SERVER SETUP ---------------------------------//
// use express to create the simple webapp
app.use(express.static('public')); // find pages in public directory

// check to make sure that the user provides the serial port for the Arduino
// when running the server
if (!process.argv[2]) {
  console.error('Usage: node ' + process.argv[1] + ' SERIAL_PORT');
  process.exit(1);
}

// start the server and say what port it is on
http.listen(serverPort, function() {
  console.log('listening on *:%s', serverPort);
});
//----------------------------------------------------------------------------//

//--Additions:
//----------------------------WEBCAM SETUP------------------------------------//
//Default options
var opts = { //These Options define how the webcam is operated.
    //Picture related
    width: 1280, //size
    height: 720,
    quality: 100,
    //Delay to take shot
    delay: 0,
    //Save shots in memory
    saveShots: true,
    // [jpeg, png] support varies
    // Webcam.OutputTypes
    output: "jpeg",
    //Which camera to use
    //Use Webcam.list() for results
    //false for default device
    device: false,
    // [location, buffer, base64]
    // Webcam.CallbackReturnTypes
    callbackReturn: "location",
    //Logging
    verbose: false
};
var Webcam = NodeWebcam.create( opts ); //starting up the webcam
//----------------------------------------------------------------------------//



//---------------------- SERIAL COMMUNICATION (Arduino) ----------------------//
// start the serial port connection and read on newlines
const serial = new SerialPort(process.argv[2], {});
const parser = new Readline({
  delimiter: '\r\n'
});

// Read data that is available on the serial port and send it to the websocket
serial.pipe(parser);
parser.on('data', function(data) {
 // console.log('Data:', data);
  io.emit('server-msg', data);
  if (data === 'detected') {
    for (i = 0; i < 3; i++) {
      var imageName = new Date().toString().replace(/[&\/\\#,+()$~%.'":*?<>{}\s-]/g, '');
      NodeWebcam.capture('public/'+imageName, opts, async function( err, data ) {
          io.emit('newPicture',(imageName+'.jpg'));
	  let foundDog = await labelDetect('/home/pi/IDD-Fa19-Lab7/public/'+imageName+'.jpg').catch( e => {console.error(e)});
	  if(foundDog){
		console.log("found your dog " + i);
		if(i == 3){
        		console.log("haha");
        		serial.write('R');
        		io.emit('detectDogs');
    		}
	  }else{
		io.emit('noDog');
	  }
      });
    }
  }

});
//----------------------------------------------------------------------------//


//---------------------- WEBSOCKET COMMUNICATION (web browser)----------------//
// this is the websocket event handler and say if someone connects
// as long as someone is connected, listen for messages
io.on('connect', function(socket) {
  console.log('a user connected');

  // if you get the 'ledON' msg, send an 'H' to the Arduino
  socket.on('ledON', function() {
    console.log('ledON');
    serial.write('H');
  });

  // if you get the 'ledOFF' msg, send an 'L' to the Arduino
  socket.on('ledOFF', function() {
    console.log('ledOFF');
    serial.write('L');
  });

  socket.on('feed',function(){
    console.log('Cat Found,rotating disk');
    serial.write('R');
  });

  //making sound to attract dog
  socket.on('sound',function(){
    console.log('Making sound');
    serial.write('S');
  });

  //-- Addition: This function is called when the client clicks on the `Take a picture` button.
  socket.on('takePicture', function() {
    /// First, we create a name for the new picture.
    /// The .replace() function removes all special characters from the date.
    /// This way we can use it as the filename.
    var imageName = new Date().toString().replace(/[&\/\\#,+()$~%.'":*?<>{}\s-]/g, '');

    console.log('making a making a picture at'+ imageName); // Second, the name is logged to the console.

      NodeWebcam.capture('public/'+imageName, opts, async function( err, data ) {
          io.emit('newPicture',(imageName+'.jpg'));
          let foundDog = await labelDetect('/home/pi/IDD-Fa19-Lab7/public/'+imageName+'.jpg').catch( e => {console.error(e)});
          if(foundDog){
               serial.write('R');
               io.emit('detectDogs');
          }else{
                io.emit('noDog');
          }
      });
  /// The browser will take this new name and load the picture from the public folder.
  });

//  });
  // if you get the 'disconnect' message, say the user disconnected
  socket.on('disconnect', function() {
    console.log('user disconnected');
  });
});
//----------------------------------------------------------------------------//
async function labelDetect(input) {
   console.log('hello');
   //Performs label detection on the image file
   //try{
   //   const [result] = await client.labelDetection(input);	
   //} catch(err){
   //   console.error(err);
   //}


   const [result] = await client.labelDetection(input).catch( e => {console.error(e)});
   const labels = result.labelAnnotations;
   console.log('Labels:');
   var foundDog = false;
   labels.forEach(function(item){
	if(item.description.toLowerCase() == 'dog'){
	   foundDog = true;
	}
   });
   console.log("FoundDog: " + foundDog);
   labels.forEach(label => console.log(label.description));
   if(foundDog){
      return true;
   //   serial.write('R');
   //   io.emit('detectDogs');
   }
   
}
