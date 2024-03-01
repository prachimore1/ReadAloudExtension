// popup.js

document.addEventListener('DOMContentLoaded', function() {
  var readAloudButton = document.getElementById('readAloudButton');
  readAloudButton.addEventListener('click', function() {
    // Send message to content script to get selected text
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'getSelectedText' });
    });
  });
});

// create a event listner for summary button
document.addEventListener('DOMContentLoaded', function() {
  var summaryButton = document.getElementById('summaryButton');
  summaryButton.addEventListener('click', function() {
    // Send message to content script to get selected text and URL
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'getSelectedTextAndURL' });
    });
  });
});

// Listen for response from content script with selected text
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'selectedText') {
    var textToSynthesize = request.selectedText;
    var apiKey = 'AIzaSyChuWYZmDjngVzpLQvBOpFwAW_Jz__rp58'; 

    fetch('https://texttospeech.googleapis.com/v1/text:synthesize?key=' + apiKey, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        input: { text: textToSynthesize },
        voice: { languageCode: 'en-US', ssmlGender: 'NEUTRAL' },
        audioConfig: { audioEncoding: 'MP3' }
      })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to synthesize speech');
      }
      return response.json();
    })
    .then(data => {
      // Play the synthesized audio
      var audio = new Audio('data:audio/mp3;base64,' + data.audioContent);
      audio.play();
    })
    .catch(error => console.error('Error:', error));
  }
});
