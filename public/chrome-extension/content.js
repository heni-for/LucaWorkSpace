// Content script for scraping course data from various platforms

(function() {
  'use strict';

  // Detect which platform we're on
  const getPlatform = () => {
    const hostname = window.location.hostname;
    if (hostname.includes('coursera.org')) return 'coursera';
    if (hostname.includes('udemy.com')) return 'udemy';
    if (hostname.includes('youtube.com')) return 'youtube';
    if (hostname.includes('moodle')) return 'moodle';
    if (hostname.includes('edx.org')) return 'edx';
    if (hostname.includes('khanacademy.org')) return 'khan';
    return 'unknown';
  };

  // Scrape course data based on platform
  const scrapeCourseData = () => {
    const platform = getPlatform();
    const data = {
      platform,
      url: window.location.href,
      title: '',
      description: '',
      chapters: [],
      timestamp: new Date().toISOString(),
    };

    try {
      switch (platform) {
        case 'coursera':
          data.title = document.querySelector('h1[data-testid="course-name"], h1.banner-title')?.innerText?.trim() || 
                      document.querySelector('h1')?.innerText?.trim() || '';
          data.description = document.querySelector('[data-testid="course-description"], .course-description')?.innerText?.trim() || '';
          
          // Extract chapters/sections
          const courseraSections = document.querySelectorAll('[data-testid="section-title"], .course-section-title');
          data.chapters = Array.from(courseraSections).map(section => ({
            title: section.innerText?.trim() || '',
            url: section.closest('a')?.href || '',
          }));
          break;

        case 'udemy':
          data.title = document.querySelector('h1[data-purpose="course-title"]')?.innerText?.trim() ||
                      document.querySelector('h1')?.innerText?.trim() || '';
          data.description = document.querySelector('[data-purpose="course-description"]')?.innerText?.trim() || '';
          
          const udemySections = document.querySelectorAll('.curriculum-item, [data-purpose="curriculum-item"]');
          data.chapters = Array.from(udemySections).map(section => ({
            title: section.innerText?.trim() || '',
            url: section.closest('a')?.href || '',
          }));
          break;

        case 'youtube':
          data.title = document.querySelector('h1.ytd-watch-metadata yt-formatted-string, h1.ytd-video-primary-info-renderer')?.innerText?.trim() ||
                      document.querySelector('h1')?.innerText?.trim() || '';
          data.description = document.querySelector('#description, #content-text')?.innerText?.trim() || '';
          
          // YouTube playlists
          const playlistItems = document.querySelectorAll('ytd-playlist-video-renderer, .playlist-video-item');
          data.chapters = Array.from(playlistItems).map(item => ({
            title: item.querySelector('#video-title, .video-title')?.innerText?.trim() || '',
            url: item.querySelector('a')?.href || '',
          }));
          break;

        case 'moodle':
          data.title = document.querySelector('h1, .page-header-headings h1')?.innerText?.trim() || '';
          data.description = document.querySelector('.course-description, .summary')?.innerText?.trim() || '';
          
          const moodleSections = document.querySelectorAll('.section-title, .sectionname');
          data.chapters = Array.from(moodleSections).map(section => ({
            title: section.innerText?.trim() || '',
            url: section.closest('a')?.href || '',
          }));
          break;

        case 'edx':
          data.title = document.querySelector('h1.course-title, .course-header-title')?.innerText?.trim() || '';
          data.description = document.querySelector('.course-description')?.innerText?.trim() || '';
          
          const edxSections = document.querySelectorAll('.chapter, .chapter-title');
          data.chapters = Array.from(edxSections).map(section => ({
            title: section.innerText?.trim() || '',
            url: section.closest('a')?.href || '',
          }));
          break;

        case 'khan':
          data.title = document.querySelector('h1, .topic-title')?.innerText?.trim() || '';
          data.description = document.querySelector('.topic-description')?.innerText?.trim() || '';
          
          const khanSections = document.querySelectorAll('.unit-title, .lesson-title');
          data.chapters = Array.from(khanSections).map(section => ({
            title: section.innerText?.trim() || '',
            url: section.closest('a')?.href || '',
          }));
          break;

        default:
          // Generic fallback - try common selectors
          data.title = document.querySelector('h1')?.innerText?.trim() || 
                      document.title || '';
          data.description = document.querySelector('meta[name="description"]')?.content ||
                            document.querySelector('p')?.innerText?.substring(0, 500) || '';
          
          const genericSections = document.querySelectorAll('h2, h3, .chapter, .section, [class*="lesson"], [class*="module"]');
          data.chapters = Array.from(genericSections).slice(0, 20).map(section => ({
            title: section.innerText?.trim() || '',
            url: section.closest('a')?.href || '',
          }));
      }
    } catch (error) {
      console.error('Error scraping course data:', error);
    }

    return data;
  };

  // Listen for messages from popup or background
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'scrapeCourse') {
      const courseData = scrapeCourseData();
      sendResponse({ success: true, data: courseData });
      return true; // Keep channel open for async
    }
  });

  // Auto-detect and notify when course page is detected
  if (getPlatform() !== 'unknown') {
    chrome.runtime.sendMessage({
      action: 'courseDetected',
      platform: getPlatform(),
      url: window.location.href,
    });
  }
})();

