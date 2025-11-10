import { AIMeetingService } from '@/lib/ai-meeting-service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, data } = body;
    
    const aiService = AIMeetingService.getInstance();
    
    switch (action) {
      case 'transcribe':
        const transcription = await aiService.processTranscription(data.audioData, data.language);
        return Response.json({ success: true, data: transcription });
        
      case 'translate':
        const translation = await aiService.translateText(data.text, data.fromLang, data.toLang);
        return Response.json({ success: true, data: translation });
        
      case 'analyze_sentiment':
        const sentiment = await aiService.analyzeSentiment(data.text, data.speaker);
        return Response.json({ success: true, data: sentiment });
        
      case 'detect_action_items':
        const actionItems = await aiService.detectActionItems(data.text, data.speaker);
        return Response.json({ success: true, data: actionItems });
        
      case 'assistant_command':
        const assistantResponse = await aiService.processAssistantCommand(data.command, data.context);
        return Response.json({ success: true, data: assistantResponse });
        
      case 'process_meeting_input':
        const results = await aiService.processMeetingInput(data);
        return Response.json({ success: true, data: results });
        
      case 'get_state':
        const state = {
          transcriptionBuffer: aiService.getTranscriptionBuffer(),
          actionItems: aiService.getActionItems(),
          sentimentAnalysis: Object.fromEntries(aiService.getSentimentAnalysis())
        };
        return Response.json({ success: true, data: state });
        
      case 'clear_buffer':
        aiService.clearBuffer();
        return Response.json({ success: true, message: 'Buffer cleared' });
        
      default:
        return Response.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('API Error:', error);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const aiService = AIMeetingService.getInstance();
    const state = {
      transcriptionBuffer: aiService.getTranscriptionBuffer(),
      actionItems: aiService.getActionItems(),
      sentimentAnalysis: Object.fromEntries(aiService.getSentimentAnalysis())
    };
    
    return Response.json({ success: true, data: state });
  } catch (error) {
    console.error('API Error:', error);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
