'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const request =require('request');
const path = require('path');

let app = express();
var count = 0;
var messengerButton = "<html></head><title>Facebook Messenger Bot</title></head><body><h1>Facebook Messenger Bot</h1>This is a bot based on Messenger Platform QuickStart. For more details, see their <a href=\"https://developers.facebook.com/docs/messenger-platform/guides/quick-start\">docs</a>.<script src=\"https://button.glitch.me/button.js\" data-style=\"glitch\"></script><div class=\"glitchButton\" style=\"position:fixed;top:20px;right:20px;\"></div></body></html>";

app.set('port', (process.env.PORT || 5000))

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());


//ROUTEs

app.get('/', function(req, res){
	res.send('Hi I am a chatbot')
	res.writeHead(200, {'Content-Type': 'text/html'});
	res.write(messengerButton);
	res.end();
});


// Facebook

app.get('/webhook/', function(req, res){
	if(req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === 'gametime'){
		console.log("Validating webhook");
		res.status(200).send(req.query['hub.challenge'])
	}else{
	console.error("Failed validation.Make sure the validation tokens match.");
	res.send(403);
	}
});

// Message processing
app.post('/webhook', function (req, res) {
  console.log(req.body);
  var data = req.body;

  // Make sure this is a page subscription
  if (data.object === 'page') {
    
    // Iterate over each entry - there may be multiple if batched
    data.entry.forEach(function(entry) {
      var pageID = entry.id;
      var timeOfEvent = entry.time;

      // Iterate over each messaging event
      entry.messaging.forEach(function(event) {
        if (event.message) {
          receivedMessage(event);
        } else if (event.postback) {
          receivedPostback(event);   
        } else {
          console.log("Webhook received unknown event: ", event);
        }
      });
    });

    // Assume all went well.
    //
    // You must send back a 200, within 20 seconds, to let us know
    // you've successfully received the callback. Otherwise, the request
    // will time out and we will keep trying to resend.
    res.sendStatus(200);
  }
});

// Incoming events handling
function receivedMessage(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;

  console.log("Received message for user %d and page %d at %d with message:", 
    senderID, recipientID, timeOfMessage);
  console.log(JSON.stringify(message));

  var messageId = message.mid;
  
  //message responses
  if(message.text.includes('help')){
	  var messageText = "I'll get you some help right away";
  } else if(message.text.includes('hello')){
	  var messageText = "Hey buddy";    //message.text
  } else if(message.text.includes('weather')){
	  var messageText = "It's nice outside right now.";
  } else if(message.text.includes('project')){
	  var messageText = "Are you interested in our project management courses?";
  } else if(message.text.includes('classes')){
	  var messageText = 'Follow the link to learn about our offerings. ' + '<a href="https://bobcatacademy.com">BOBCAT</a>';
  }else if(message.text.includes('pmi')){
	  var messageText = "Would like more information on pmi certification classes or changes?";
  }else if(message.text.includes('cert')){
	  var messageText = "You can see our certification classes at https://bobcatacademy.com/enroll";
  }else if(message.text.includes('changes')){
	  var messageText = "You can see upcoming changes at http://pmi.org";
  }else if (message.text.includes('time')){
	  var date = new Date();
	  var current_hour = date.getHours();
	  var messageText = "The current time is: " + current_hour;
  }else if (message.text.includes('day is it')){
	  var date = new Date();
	  var current_day = date.getDay();
	  var messageText = "The current day is: " + current_day;
  }else if(message.text.includes('thanks')){
	var messageText = "You're welcome. Is there anything else I can help you with?";	
  }else if(message.text.includes('ok')){
	  var messageText = "Is there anything else I can help you with?";	
  }else if(message.text.includes('yes')){
	  var messageText = "Okay. How can I help you?";
  }else if (message.text.includes('no')){
	  var messageText = "Great have a good day!";
  }else if(count >= 3){
    var messageText = "Let me get someone to assist you.";
  }else{
	  var num = Math.floor(Math.random()*3+1);
	  switch(num){
		  case 1:
			  var messageText = "I'm sorry. Could you repeat that?";
        count++;
			  break;
		  case 2:
			  var messageText = "Do you have a question for me today?";
        count++;
			  break;
		  case 3:
			  var messageText = "How can I help you?";
        count++;
			  break;

	  }
  }
  //var messageText = "Hey buddy";    //message.text
  var messageAttachments = message.attachments;

  if (messageText) {
    // If we receive a text message, check to see if it matches a keyword
    // and send back the template example. Otherwise, just echo the text we received.
    switch (messageText) {
      case 'generic':
        sendGenericMessage(senderID);
        break;
      default:
        sendTextMessage(senderID, messageText);
    }
  } else if (messageAttachments) {
    sendTextMessage(senderID, "Message with attachment received");
  }
}

function receivedPostback(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfPostback = event.timestamp;

  // The 'payload' param is a developer-defined field which is set in a postback 
  // button for Structured Messages. 
  var payload = event.postback.payload;

  console.log("Received postback for user %d and page %d with payload '%s' " + 
    "at %d", senderID, recipientID, payload, timeOfPostback);

  // When a postback is called, we'll send a message back to the sender to 
  // let them know it was successful
  sendTextMessage(senderID, "Postback called");
}

//////////////////////////
// Sending helpers
//////////////////////////
function sendTextMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText
    }
  };

  callSendAPI(messageData);
}

function sendGenericMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [{
            title: "rift",
            subtitle: "Next-generation virtual reality",
            item_url: "https://www.oculus.com/en-us/rift/",               
            image_url: "http://messengerdemo.parseapp.com/img/rift.png",
            buttons: [{
              type: "web_url",
              url: "https://www.oculus.com/en-us/rift/",
              title: "Open Web URL"
            }, {
              type: "postback",
              title: "Call Postback",
              payload: "Payload for first bubble",
            }],
          }, {
            title: "touch",
            subtitle: "Your Hands, Now in VR",
            item_url: "https://www.oculus.com/en-us/touch/",               
            image_url: "http://messengerdemo.parseapp.com/img/touch.png",
            buttons: [{
              type: "web_url",
              url: "https://www.oculus.com/en-us/touch/",
              title: "Open Web URL"
            }, {
              type: "postback",
              title: "Call Postback",
              payload: "Payload for second bubble",
            }]
          }]
        }
      }
    }
  };  

  callSendAPI(messageData);
}

function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: 'access_token' },
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      console.log("Successfully sent generic message with id %s to recipient %s", 
        messageId, recipientId);
    } else {
      console.error("Unable to send message.");
      console.error(response);
      console.error(error);
    }
  });  
}

app.listen(app.get('port'), function(){
	console.log('running: port')
})
