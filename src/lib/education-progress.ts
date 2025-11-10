type TopicProgress = {
  topicId: string;
  topicName: string;
  firstStudied: string; // ISO date
  lastStudied: string;
  revisionDates: string[]; // ISO dates - spaced repetition schedule
  quizScores: number[]; // 0-100
  masteryLevel: 'new' | 'learning' | 'reviewing' | 'mastered'; // based on spaced repetition
};

type CourseProgress = {
  courseName: string;
  courseId: string;
  startDate: string;
  examDate?: string;
  topics: TopicProgress[];
  overallProgress: number; // 0-100
};

type ProgressSnapshot = {
  outlineViews: number;
  quizzesTaken: number;
  avgScore: number; // 0-100
  courses: CourseProgress[];
  revisionReminders: Array<{
    topicId: string;
    topicName: string;
    dueDate: string; // Next revision due date
    courseName: string;
  }>;
};

const STORAGE_KEY = 'luca.education.progress.v2';

function load(): ProgressSnapshot {
  if (typeof window === 'undefined') return getDefault();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : getDefault();
    // Migrate old format if needed
    if (!parsed.courses) parsed.courses = [];
    if (!parsed.revisionReminders) parsed.revisionReminders = [];
    return parsed;
  } catch { return getDefault(); }
}

function getDefault(): ProgressSnapshot {
  return {
    outlineViews: 0,
    quizzesTaken: 0,
    avgScore: 0,
    courses: [],
    revisionReminders: [],
  };
}

function save(s: ProgressSnapshot) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

// Spaced repetition: Day 1, Day 3, Day 7, Day 14, Day 30
function getNextRevisionDates(firstDate: string, completedRevisions: number): string[] {
  const intervals = [1, 3, 7, 14, 30];
  const first = new Date(firstDate);
  const nextDates: string[] = [];
  for (let i = completedRevisions; i < intervals.length; i++) {
    const date = new Date(first);
    date.setDate(date.getDate() + intervals[i]);
    nextDates.push(date.toISOString());
  }
  return nextDates;
}

function updateRevisionReminders(snapshot: ProgressSnapshot) {
  const now = new Date();
  const reminders: ProgressSnapshot['revisionReminders'] = [];
  
  snapshot.courses.forEach(course => {
    course.topics.forEach(topic => {
      if (topic.revisionDates.length > 0) {
        const nextRevision = topic.revisionDates[0];
        const dueDate = new Date(nextRevision);
        if (dueDate <= now || dueDate.getTime() - now.getTime() < 24 * 60 * 60 * 1000) { // Due today or overdue
          reminders.push({
            topicId: topic.topicId,
            topicName: topic.topicName,
            dueDate: nextRevision,
            courseName: course.courseName,
          });
        }
      }
    });
  });
  
  snapshot.revisionReminders = reminders;
  return snapshot;
}

export const eduProgress = {
  get(): ProgressSnapshot {
    const s = load();
    return updateRevisionReminders(s);
  },
  
  viewedOutline() {
    const s = load();
    s.outlineViews += 1;
    save(s);
  },
  
  recordQuiz(scorePct: number, courseName?: string, topicId?: string) {
    const s = load();
    const total = s.quizzesTaken;
    s.avgScore = Math.round(((s.avgScore * total) + scorePct) / (total + 1));
    s.quizzesTaken += 1;
    
    // Update topic-specific progress if course/topic provided
    if (courseName && topicId) {
      let course = s.courses.find(c => c.courseName === courseName);
      if (!course) {
        course = {
          courseName,
          courseId: `course_${Date.now()}`,
          startDate: new Date().toISOString(),
          topics: [],
          overallProgress: 0,
        };
        s.courses.push(course);
      }
      
      let topic = course.topics.find(t => t.topicId === topicId);
      if (!topic) {
        topic = {
          topicId,
          topicName: topicId,
          firstStudied: new Date().toISOString(),
          lastStudied: new Date().toISOString(),
          revisionDates: getNextRevisionDates(new Date().toISOString(), 0),
          quizScores: [],
          masteryLevel: 'new',
        };
        course.topics.push(topic);
      }
      
      topic.quizScores.push(scorePct);
      topic.lastStudied = new Date().toISOString();
      
      // Update mastery level based on performance
      const avgScore = topic.quizScores.reduce((a, b) => a + b, 0) / topic.quizScores.length;
      if (avgScore >= 90) topic.masteryLevel = 'mastered';
      else if (avgScore >= 70) topic.masteryLevel = 'reviewing';
      else if (topic.quizScores.length >= 2) topic.masteryLevel = 'learning';
      
      // Schedule next revision if quiz passed
      if (scorePct >= 70 && topic.revisionDates.length === 0) {
        topic.revisionDates = getNextRevisionDates(topic.firstStudied, topic.quizScores.length - 1);
      } else if (scorePct >= 70 && topic.revisionDates.length > 0) {
        // Mark current revision as done, schedule next
        topic.revisionDates.shift();
        if (topic.revisionDates.length === 0 && topic.masteryLevel !== 'mastered') {
          topic.revisionDates = getNextRevisionDates(topic.lastStudied, 0);
        }
      }
      
      // Update course overall progress
      const completedTopics = course.topics.filter(t => t.masteryLevel === 'mastered').length;
      course.overallProgress = Math.round((completedTopics / Math.max(course.topics.length, 1)) * 100);
    }
    
    save(updateRevisionReminders(s));
  },
  
  addCourse(courseName: string, topics: string[], examDate?: string) {
    const s = load();
    const course: CourseProgress = {
      courseName,
      courseId: `course_${Date.now()}`,
      startDate: new Date().toISOString(),
      examDate,
      topics: topics.map((t, i) => ({
        topicId: `topic_${i}`,
        topicName: t,
        firstStudied: '',
        lastStudied: '',
        revisionDates: [],
        quizScores: [],
        masteryLevel: 'new',
      })),
      overallProgress: 0,
    };
    s.courses.push(course);
    save(s);
  },
  
  markTopicStudied(courseName: string, topicId: string) {
    const s = load();
    const course = s.courses.find(c => c.courseName === courseName);
    if (!course) return;
    
    const topic = course.topics.find(t => t.topicId === topicId);
    if (!topic) return;
    
    const now = new Date().toISOString();
    if (!topic.firstStudied) {
      topic.firstStudied = now;
      topic.revisionDates = getNextRevisionDates(now, 0);
      topic.masteryLevel = 'learning';
    }
    topic.lastStudied = now;
    
    save(updateRevisionReminders(s));
  },
};


