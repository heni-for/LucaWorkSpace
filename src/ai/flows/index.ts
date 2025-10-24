'use server';

import { generateDerjaReport } from './derja-report-generation';
import { classifyEmail } from './email-classification-and-priority';
import { emailSummaryAndReplySuggestions } from './email-summary-and-reply-suggestions';
import { textToSpeech } from './text-to-speech';

export { generateDerjaReport, classifyEmail, emailSummaryAndReplySuggestions, textToSpeech };
