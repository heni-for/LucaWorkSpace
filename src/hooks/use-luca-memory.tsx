'use client';

import * as React from 'react';
import { memory, extractProjectNames } from '@/lib/memory';

export function useLucaMemory() {
  const rememberFromText = React.useCallback((text: string, source?: string) => {
    if (!text) return;
    const names = extractProjectNames(text);
    if (names.length) memory.rememberProjects(names, source);
  }, []);

  const getProjects = React.useCallback(() => memory.listProjects(), []);
  const getSnapshot = React.useCallback(() => memory.getSnapshot(), []);

  return { rememberFromText, getProjects, getSnapshot, memory };
}


