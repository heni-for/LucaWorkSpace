import { config } from 'dotenv';
config();

import '@/ai/flows/derja-report-generation.ts';
import '@/ai/flows/email-classification-and-priority.ts';
import '@/ai/flows/email-summary-and-reply-suggestions.ts';