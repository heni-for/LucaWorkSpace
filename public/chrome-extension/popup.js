// Popup script for LUCA Course Importer

document.addEventListener('DOMContentLoaded', async () => {
  const importBtn = document.getElementById('importBtn');
  const statusDiv = document.getElementById('status');
  const coursePreview = document.getElementById('coursePreview');
  const courseTitle = document.getElementById('courseTitle');
  const coursePlatform = document.getElementById('coursePlatform');
  const chapterCount = document.getElementById('chapterCount');
  const apiUrlInput = document.getElementById('apiUrl');
  const saveSettingsBtn = document.getElementById('saveSettings');

  let courseData = null;

  // Load saved API URL
  chrome.storage.sync.get(['lucaApiUrl'], (result) => {
    if (result.lucaApiUrl) {
      apiUrlInput.value = result.lucaApiUrl;
    }
  });

  // Save settings
  saveSettingsBtn.addEventListener('click', () => {
    const url = apiUrlInput.value.trim();
    if (url) {
      chrome.storage.sync.set({ lucaApiUrl: url }, () => {
        showStatus('Settings saved!', 'success');
      });
    }
  });

  // Load course data from current tab
  const loadCourseData = async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab.url || (!tab.url.startsWith('http://') && !tab.url.startsWith('https://'))) {
        showStatus('Not a valid web page', 'error');
        importBtn.disabled = true;
        return;
      }

      if (!tab.id) {
        showStatus('Cannot access tab', 'error');
        importBtn.disabled = true;
        return;
      }

      // First, inject content script if not already injected
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js']
        });
      } catch (e) {
        // Content script might already be injected, that's okay
      }

      // Wait a bit for content script to initialize
      await new Promise(resolve => setTimeout(resolve, 500));

      // Request course data from content script
      chrome.tabs.sendMessage(tab.id, { action: 'scrapeCourse' }, (response) => {
        if (chrome.runtime.lastError) {
          // Content script not ready, try direct execution
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
              const hostname = window.location.hostname;
              let platform = 'unknown';
              if (hostname.includes('coursera')) platform = 'coursera';
              else if (hostname.includes('udemy')) platform = 'udemy';
              else if (hostname.includes('youtube')) platform = 'youtube';
              else if (hostname.includes('moodle')) platform = 'moodle';
              else if (hostname.includes('edx')) platform = 'edx';
              else if (hostname.includes('khanacademy')) platform = 'khan';

              const title = document.querySelector('h1')?.innerText?.trim() || document.title;
              const description = document.querySelector('meta[name="description"]')?.content || 
                                document.querySelector('p')?.innerText?.substring(0, 500) || '';
              
              const sections = Array.from(document.querySelectorAll('h2, h3, .chapter, .section, [class*="lesson"]')).slice(0, 20);
              const chapters = sections.map(s => ({
                title: s.innerText?.trim() || '',
                url: s.closest('a')?.href || window.location.href,
              })).filter(ch => ch.title);

              return {
                success: true,
                data: {
                  platform,
                  url: window.location.href,
                  title,
                  description,
                  chapters,
                  timestamp: new Date().toISOString(),
                }
              };
            }
          }).then(results => {
            if (results && results[0]?.result?.success) {
              courseData = results[0].result.data;
              updatePreview();
            } else {
              showStatus('Could not detect course data', 'info');
              importBtn.disabled = true;
            }
          });
          return;
        }

        if (response?.success && response.data) {
          courseData = response.data;
          updatePreview();
        } else {
          showStatus('Could not detect course. Make sure you are on a course page.', 'info');
          importBtn.disabled = true;
        }
      });
    } catch (error) {
      console.error('Error loading course data:', error);
      showStatus('Error: ' + error.message, 'error');
      importBtn.disabled = true;
    }
  };

  const updatePreview = () => {
    if (courseData && courseData.title) {
      coursePreview.style.display = 'block';
      courseTitle.textContent = courseData.title || 'Untitled Course';
      coursePlatform.textContent = `Platform: ${courseData.platform}`;
      chapterCount.textContent = `${courseData.chapters?.length || 0} chapters/sections detected`;
      importBtn.disabled = false;
    }
  };

  // Import course to LUCA
  importBtn.addEventListener('click', async () => {
    if (!courseData || !courseData.title) {
      showStatus('No course data available', 'error');
      return;
    }

    importBtn.disabled = true;
    importBtn.textContent = '⏳ Importing...';
    showStatus('Importing course to LUCA...', 'info');

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'sendCourseToLuca',
        courseData: courseData,
      });

      if (response.success) {
        showStatus('✅ Course imported successfully! Check LUCA Education page.', 'success');
        importBtn.textContent = '✅ Imported';
        setTimeout(() => {
          window.close();
        }, 2000);
      } else {
        showStatus('❌ Error: ' + (response.error || 'Failed to import'), 'error');
        importBtn.disabled = false;
        importBtn.textContent = '📥 Import Course to LUCA';
      }
    } catch (error) {
      console.error('Import error:', error);
      showStatus('❌ Error: ' + error.message, 'error');
      importBtn.disabled = false;
      importBtn.textContent = '📥 Import Course to LUCA';
    }
  });

  // Helper function to show status
  const showStatus = (message, type = 'info') => {
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    statusDiv.style.display = 'block';
    
    if (type === 'success') {
      setTimeout(() => {
        statusDiv.style.display = 'none';
      }, 3000);
    }
  };

  // Load course data on popup open
  loadCourseData();
});

