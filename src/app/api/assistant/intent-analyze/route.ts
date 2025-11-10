import { NextRequest, NextResponse } from 'next/server';

/**
 * AI-Powered Intent Analysis
 * Uses AI to understand what user wants instead of exact matching
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { command } = body;

    if (!command) {
      return NextResponse.json(
        { error: 'Command is required' },
        { status: 400 }
      );
    }

    console.log('🧠 AI analyzing command:', command);

    // Get Gemini API key
    const apiKey = process.env.GEMINI_API_KEY || 
                   process.env.GOOGLE_API_KEY || 
                   process.env.GOOGLE_GENAI_API_KEY;

    if (!apiKey) {
      throw new Error('No AI API key configured');
    }

    // Use Gemini to analyze intent
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are LUCA's intent analyzer. Analyze this Arabic/French/English command and determine what the user wants.

USER SAID: "${command}"

AVAILABLE ACTIONS:
- open_mail (ANY mention of: email, ايميل, إيميل, الايميل, mail, boite, gmail, message, رسالة, بريد, ميل, inbox, صندوق, ايميلات)
- open_dashboard (ANY mention of: dashboard, داشبورد, الداشبورد, ديسبورد, الديسبورد, داش بورد, داش, dash, board, home, accueil, لوحة, الرئيسية)
- open_calendar (ANY mention of: calendar, calendrier, كالندري, الكالندري, كالند, agenda, موعد, تقويم, أجندة, schedule)
- open_tasks (ANY mention of: task, tasks, تسك, تسكة, تسكات, التسكات, مهمة, مهام, المهام, todo, تاسك)
- open_notes (ANY mention of: note, notes, نوت, النوت, ملاحظة, ملاحظات, مذكرة, تدوين)
- open_education (ANY mention of: education, éducation, دراسة, الدراسة, تعليم, التعليم, cours, école, درس, تعلم)
- open_meetings (ANY mention of: meeting, meetings, réunion, اجتماع, اجتماعات, لقاء, ميتينغ, rencontre)
- open_team (ANY mention of: team, équipe, فريق, الفريق, groupe, زملاء, أعضاء, colleagues)
- open_projects (ANY mention of: project, projects, مشروع, مشاريع, المشاريع, المشروع, بروجيه, travail, work)
- tell_time (ANY mention of: time, وقت, الوقت, ساعة, قداش, heure, clock, temps)
- stop (ANY mention of: stop, خلاص, وقف, arrête)
- help (ANY mention of: help, مساعدة, عاوني, aide)
- unknown (only if absolutely no clue what user wants)

CRITICAL RULES:
1. Look for MEANING and INTENT, IGNORE exact spelling!
2. "حلي الديسبورد" = dashboard (الديسبورد is dashboard with "the")
3. "ورّي الكالندري" = calendar (even with "the" prefix)
4. "الايميل" = email (with "the")
5. Arabic "ال" (the) is COMMON - ignore it when matching!
6. "ديسبورد" is dashboard misspelled - STILL dashboard!
7. ANY word close to dashboard/calendar/email = that action
8. Be VERY flexible with spelling variations
9. Confidence should be HIGH (>0.85) if you find ANY keyword match
10. Only return "unknown" if absolutely NOTHING matches

CRITICAL: You MUST respond with ONLY valid JSON. No markdown, no explanation, JUST the JSON object.

Response format:
{"action": "open_mail", "confidence": 0.95, "arabic_response": "حاضر، نحلّك الإيميلات"}

EXAMPLES:
- Command: "حلي الديسبورد" → {"action": "open_dashboard", "confidence": 0.95, "arabic_response": "حاضر، نحلّك dashboard تو"}
- Command: "حل داشبورد" → {"action": "open_dashboard", "confidence": 0.92, "arabic_response": "حاضر، نحلّك dashboard تو"}
- Command: "الديسبورد" → {"action": "open_dashboard", "confidence": 0.90, "arabic_response": "حاضر، نحلّك dashboard تو"}
- Command: "ديسبورد" → {"action": "open_dashboard", "confidence": 0.88, "arabic_response": "حاضر، نحلّك dashboard تو"}
- Command: "الايميل" → {"action": "open_mail", "confidence": 0.95, "arabic_response": "حاضر، نحلّك الإيميلات تو"}
- Command: "تسكات" → {"action": "open_tasks", "confidence": 0.93, "arabic_response": "نورّيك التسكات"}

Now analyze and respond with ONLY the JSON object:`
            }]
          }],
          generationConfig: {
            temperature: 0.3, // Low temperature for consistent intent detection
            maxOutputTokens: 200,
          }
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'AI analysis failed');
    }

    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    console.log('🤖 AI raw response:', aiResponse);

    // Parse JSON from AI response with better error handling
    let intent;
    try {
      console.log('📝 Parsing AI response...');
      
      // Remove markdown code blocks if present
      let cleanResponse = aiResponse.trim();
      if (cleanResponse.startsWith('```json')) {
        cleanResponse = cleanResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (cleanResponse.startsWith('```')) {
        cleanResponse = cleanResponse.replace(/```\n?/g, '');
      }
      
      // Extract JSON object
      const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        intent = JSON.parse(jsonMatch[0]);
        console.log('✅ Successfully parsed JSON:', intent);
      } else {
        throw new Error('No JSON found in response');
      }
      
      // Validate required fields
      if (!intent.action) {
        throw new Error('Missing action field');
      }
      
      // Ensure confidence is a number
      if (typeof intent.confidence !== 'number') {
        intent.confidence = 0.85; // Default high confidence if not specified
      }
      
      // Ensure arabic_response exists
      if (!intent.arabic_response) {
        intent.arabic_response = 'تمام!';
      }
      
    } catch (parseError) {
      console.error('❌ Failed to parse AI response:', parseError);
      console.error('📄 Raw AI response:', aiResponse);
      
      // Intelligent fallback based on keywords
      const cmd = command.toLowerCase();
      if (cmd.includes('داشبورد') || cmd.includes('ديسبورد') || cmd.includes('dashboard') || cmd.includes('داش')) {
        intent = {
          action: 'open_dashboard',
          confidence: 0.85,
          arabic_response: 'حاضر، نحلّك dashboard تو.'
        };
      } else if (cmd.includes('ايميل') || cmd.includes('إيميل') || cmd.includes('mail') || cmd.includes('email') || cmd.includes('ميل')) {
        intent = {
          action: 'open_mail',
          confidence: 0.85,
          arabic_response: 'حاضر، نحلّك الإيميلات تو.'
        };
      } else if (cmd.includes('كالندري') || cmd.includes('calendar') || cmd.includes('calendrier') || cmd.includes('agenda')) {
        intent = {
          action: 'open_calendar',
          confidence: 0.85,
          arabic_response: 'حاضر، نورّيك الكالندري.'
        };
      } else {
        intent = {
          action: 'unknown',
          confidence: 0.3,
          arabic_response: 'معليش، ما فهمتش. قلّي "help" باش نورّيك الأوامر.'
        };
      }
    }

    console.log('✅ Final intent:', intent);

    return NextResponse.json(intent);
  } catch (error: any) {
    console.error('❌ Intent analysis error:', error);
    return NextResponse.json(
      {
        action: 'unknown',
        confidence: 0,
        arabic_response: 'معليش، صار مشكل',
        error: error.message
      },
      { status: 200 } // Return 200 to avoid breaking flow
    );
  }
}

