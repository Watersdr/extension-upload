
chrome.runtime.onInstalled.addListener(details => {
  switch(details.reason) {
    case 'install':
      console.log('INSTALLED');
      break;
    default:
      break;
  }
});