// content.js

// Listen for messages from the popup script
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'getSelectedText') {
    // Retrieve the selected text
    var selectedText = window.getSelection().toString();
    // Send the selected text to the popup script
    chrome.runtime.sendMessage({ action: 'selectedText', selectedText: selectedText });
  }
  else if (request.action === 'getSelectedTextAndURL') {
    var selectedText = window.getSelection().toString();
    var pageURL = window.location.href;
    chrome.runtime.sendMessage({ action: 'selectedTextAndURL', selectedText: selectedText, pageURL: pageURL });
  }
});
