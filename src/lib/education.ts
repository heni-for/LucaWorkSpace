import type { CourseMaterial } from '@/types/education';

const store: { courses: CourseMaterial[] } = { courses: [] };

export const educationStore = {
  list(): CourseMaterial[] { return store.courses; },
  add(title: string, text: string): CourseMaterial {
    const id = `${Date.now()}`;
    const material: CourseMaterial = {
      id,
      title,
      language: 'ar-TN',
      createdAt: new Date().toISOString(),
      sections: [
        { id: `${id}-1`, title: 'Full Text', content: text },
      ],
    };
    store.courses.push(material);
    return material;
  },
  get(id: string) { return store.courses.find(c => c.id === id); },
};


