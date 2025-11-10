// Background service worker for LUCA Course Importer

chrome.runtime.onInstalled.addListener(() => {
  console.log('LUCA Course Importer installed');
});

// Listen for course detection from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'courseDetected') {
    // Store detected course info
    chrome.storage.local.set({
      lastDetectedCourse: {
        platform: request.platform,
        url: request.url,
        timestamp: new Date().toISOString(),
      }
    });
  }
});

// Get API base URL from storage or use default
const getApiUrl = async () => {
  const result = await chrome.storage.sync.get(['lucaApiUrl']);
  return result.lucaApiUrl || 'http://localhost:9002';
};

// Helper to send course data to LUCA API
const sendCourseToLuca = async (courseData) => {
  try {
    const apiUrl = await getApiUrl();
    const response = await fetch(`${apiUrl}/api/education/import-course`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(courseData),
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    
    // Also try to notify the LUCA web app if it's open
    chrome.tabs.query({ url: `${apiUrl}/*` }, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, {
          type: 'LUCA_COURSE_IMPORT',
          course: result.course || courseData,
        }).catch(() => {
          // Tab might not have content script, that's okay
        });
      });
    });
    
    return result;
  } catch (error) {
    console.error('Error sending course to LUCA:', error);
    throw error;
  }
};

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'sendCourseToLuca') {
    sendCourseToLuca(request.courseData)
      .then(result => {
        sendResponse({ success: true, data: result });
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message });
      });
    return true; // Keep channel open for async
  }
  
  if (request.action === 'getApiUrl') {
    getApiUrl().then(url => {
      sendResponse({ url });
    });
    return true;
  }
  
  if (request.action === 'setApiUrl') {
    chrome.storage.sync.set({ lucaApiUrl: request.url });
    sendResponse({ success: true });
    return true;
  }
});

