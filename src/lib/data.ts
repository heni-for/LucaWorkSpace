export type Email = {
  id: string;
  sender: string;
  avatar: string;
  subject: string;
  body: string;
  date: string;
  read: boolean;
  category?: 'Work' | 'Personal' | 'Promotions';
  priority?: 'High' | 'Medium' | 'Low';
};

export const emails: Email[] = [
  {
    id: '1',
    sender: 'Amira Gharbi',
    avatar: 'AG',
    subject: 'Project Phoenix Update',
    body: 'Hello team, the latest build for Project Phoenix is now live on the staging server. Please conduct a thorough review and report any bugs by EOD Friday. The focus is on the new voice command integration. Thanks!',
    date: '3 minutes ago',
    read: false,
    category: 'Work',
    priority: 'High',
  },
  {
    id: '2',
    sender: 'Karim Trabelsi',
    avatar: 'KT',
    subject: 'Re: Q3 Marketing Budget',
    body: 'Approved. Please proceed with the proposed budget for the Q3 campaign. Let\'s schedule a follow-up meeting for next week to discuss the initial results.',
    date: '28 minutes ago',
    read: false,
  },
  {
    id: '3',
    sender: 'LinkedIn',
    avatar: 'LI',
    subject: 'You have a new connection request',
    body: 'Yassine Ben Ali, CEO at InnovateTN, wants to connect with you on LinkedIn. Knowing Yassine might help you build your professional network.',
    date: '1 hour ago',
    read: true,
    category: 'Promotions',
  },
  {
    id: '4',
    sender: 'Selma Bouzid',
    avatar: 'SB',
    subject: 'Weekend Plans?',
    body: 'Hey! Long time no see. Are you free this weekend? A few of us are planning to go to the beach on Saturday. Let me know if you can make it!',
    date: '4 hours ago',
    read: true,
    category: 'Personal',
    priority: 'Medium',
  },
  {
    id: '5',
    sender: 'GitHub',
    avatar: 'GH',
    subject: '[luca-platform] 1 new issue was created',
    body: 'A new issue (#42) has been opened in the `luca-platform/frontend` repository: "UI bug on mobile calendar view". Please review and assign.',
    date: 'Yesterday',
    read: true,
    category: 'Work',
    priority: 'High',
  },
    {
    id: '6',
    sender: 'Vercel',
    avatar: 'V',
    subject: 'Deployment Successful: luca-reimagined',
    body: 'Your latest deployment for the project `luca-reimagined` is now live. The build completed in 1m 32s. You can view the deployment at luca-reimagined.vercel.app.',
    date: 'Yesterday',
    read: true,
  },
];

export type Task = {
  id: string;
  title: string;
  status: 'Todo' | 'In Progress' | 'Done';
  priority: 'Low' | 'Medium' | 'High';
  dueDate?: string;
};

export const tasks: Task[] = [
  { id: '1', title: 'Finalize Q3 report for management', status: 'In Progress', priority: 'High', dueDate: '2 days' },
  { id: '2', title: 'Develop prototype for Derja voice notes', status: 'Todo', priority: 'High', dueDate: '1 week' },
  { id: '3', title: 'Refactor authentication module', status: 'Todo', priority: 'Medium', dueDate: '2 weeks' },
  { id: '4', title: 'Update dependencies for the main project', status: 'Done', priority: 'Low' },
  { id: '5', title: 'Book flight tickets for Tunis-Paris', status: 'In Progress', priority: 'Medium', dueDate: '4 days' },
];

export type CalendarEvent = {
  id: string;
  title: string;
  time: string;
  duration: string;
  type: 'meeting' | 'reminder' | 'event';
};

export const calendarEvents: CalendarEvent[] = [
    { id: '1', title: 'Daily Standup', time: '9:00 AM', duration: '15min', type: 'meeting' },
    { id: '2', title: 'Design Sync with UI/UX Team', time: '11:00 AM', duration: '1h', type: 'meeting' },
    { id: '3', title: 'Lunch with Karim', time: '1:00 PM', duration: '45min', type: 'event' },
    { id: '4', title: 'Call with potential investor', time: '3:30 PM', duration: '30min', type: 'meeting' },
];

export type Note = {
  id: string;
  title: string;
  content: string;
  lastUpdated: string;
  color: string;
};

export const notes: Note[] = [
    {id: '1', title: 'Meeting Notes - Q3 Kickoff', content: 'Key takeaways: Focus on user acquisition. Double down on content marketing. AI features are our main differentiator...', lastUpdated: '2 hours ago', color: 'bg-blue-100 dark:bg-blue-900/30'},
    {id: '2', title: 'Ideas for LUCA v2', content: '1. Gamification elements.\n2. Deeper calendar integrations.\n3. Offline mode for tasks & notes.', lastUpdated: 'Yesterday', color: 'bg-yellow-100 dark:bg-yellow-900/30'},
    {id: '3', title: 'Derja Voice Commands List', content: '"زيد تاسك جديدة", "شنوة عندي اليوم؟", "اقرا آخر إيميل"...', lastUpdated: '3 days ago', color: 'bg-green-100 dark:bg-green-900/30'},
];

export type Document = {
  id: string;
  title: string;
  createdAt: string;
  author: {
    name: string;
    avatar: string;
  };
};

export const documents: Document[] = [
  { id: '1', title: 'Project Phoenix: Technical Specification', createdAt: '2 days ago', author: { name: 'Amira Gharbi', avatar: 'AG' } },
  { id: '2', title: 'Q3 2025 Marketing Strategy', createdAt: '5 days ago', author: { name: 'Karim Trabelsi', avatar: 'KT' } },
  { id: '3', title: 'Onboarding Guide for New Engineers', createdAt: '1 week ago', author: { name: 'Luca User', avatar: 'LU' } },
  { id: '4', title: 'API Documentation v1.2', createdAt: '2 weeks ago', author: { name: 'Amira Gharbi', avatar: 'AG' } },
];

export type Whiteboard = {
  id: string;
  title: string;
  lastModified: string;
  thumbnailUrl: string;
};

export const whiteboards: Whiteboard[] = [
  { id: '1', title: 'User Flow - AI Assistant', lastModified: '3 hours ago', thumbnailUrl: 'https://picsum.photos/seed/wb1/600/400' },
  { id: '2', title: 'Mobile App Redesign Brainstorm', lastModified: 'Yesterday', thumbnailUrl: 'https://picsum.photos/seed/wb2/600/400' },
  { id: '3', title: 'Q4 Roadmap Planning', lastModified: '4 days ago', thumbnailUrl: 'https://picsum.photos/seed/wb3/600/400' },
];

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'Owner' | 'Admin' | 'Member';
  status: 'Active' | 'Pending';
};

export const teamMembers: TeamMember[] = [
  { id: '1', name: 'Luca User', email: 'user@luca-platform.com', avatar: 'LU', role: 'Owner', status: 'Active' },
  { id: '2', name: 'Amira Gharbi', email: 'amira.gharbi@example.com', avatar: 'AG', role: 'Admin', status: 'Active' },
  { id: '3', name: 'Karim Trabelsi', email: 'karim.trabelsi@example.com', avatar: 'KT', role: 'Member', status: 'Active' },
  { id: '4', name: 'Selma Bouzid', email: 'selma.bouzid@example.com', avatar: 'SB', role: 'Member', status: 'Pending' },
];
