// popup.js

// create a event listner for read aloud button
document.addEventListener('DOMContentLoaded', function() {
  var button = document.getElementById('readAloudButton');
  if(button) {
      button.addEventListener('click', function() {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
          chrome.tabs.sendMessage(tabs[0].id, { action: 'getSelectedText' });
        });
      });
  } else {
      console.error('Read Aloud Button not found!');
  }
});

// create a event listner for summary button
document.addEventListener('DOMContentLoaded', function() {
  var summaryButton = document.getElementById('summaryButton');
  if(summaryButton) {
    summaryButton.addEventListener('click', function() {
      // Send message to content script to get selected text and URL
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'getSelectedTextAndURL' });
      });
    });
  } else {
    console.error('Summary Button not found!');
  } 
});

// Listen for response from content script with selected text and call Google Cloud Text-to-Speech API
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

// Listen for response from content script with selected text and URL and call ChatGPT API
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'selectedTextAndURL') {

    const openAIKey = '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';
    const apiEndpoint = 'https://api.openai.com/v1/completions';
    var textToSummarize = request.selectedText;
    var pageURL = request.url;

    console.log("selectedText and url in popup=", textToSummarize, pageURL);

    const requestBody = {
      prompt: "Summarize the selected text with context from the page:\n\n" + textToSummarize + "\n\nPage URL: " + pageURL,
      temperature: 0.1,
      max_tokens: 150,
      top_p: 1.0,
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
      model: "davinci-002"
    };
  
    fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openAIKey}`,
      },
      body: JSON.stringify(requestBody),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to summerize selected Text', response.status, response.body);
      }
      return response.json();
    })
    .then(data => {
      if (data.choices && data.choices.length > 0 && data.choices[0].text) {
        const summaryText = data.choices[0].text.trim();
        console.log('Summary:', summaryText);
        document.getElementById('summaryText').textContent = summaryText;
      }
    })
    .catch(error => console.error('Error:', error));
  }
});
