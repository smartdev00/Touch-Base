import { format, addWeeks, addDays, addMonths, parse, isValid } from 'date-fns';
import { CustomTag } from '../types/tags';

interface ProcessedNote {
  text: string;
  timestamp: string;
  location: string;
  names: string[];
  nature: string;
  followupDate: string | null;
  tags: CustomTag[];
}

// Validation function
function validateProcessedData(data: any): ProcessedNote {
  // Validate location
  if (typeof data.location !== 'string') {
    throw new Error('Location must be a string');
  }

  // Validate names array
  if (!Array.isArray(data.names)) {
    throw new Error('Names must be an array');
  }

  // Validate nature (now just checking it's a string)
  if (typeof data.nature !== 'string') {
    throw new Error('Nature must be a string');
  }

  // Validate followupDate
  if (data.followupDate !== null) {
    const date = new Date(data.followupDate);
    if (!isValid(date)) {
      throw new Error('Invalid followup date format');
    }
  }

  return {
    text: data.text,
    timestamp: data.timestamp,
    location: data.location,
    names: data.names,
    nature: data.nature,
    followupDate: data.followupDate,
    tags: data.tags,
  };
}

export async function processTranscription(text: string, noteDate: string, openaiKey: string): Promise<ProcessedNote> {
  const currentDate = new Date(noteDate);

  const prompt = `
    Analyze this voice note and extract structured information. The note was recorded on ${format(currentDate, 'MMMM d, yyyy h:mm a')}.

    Voice note: "${text}"

    Please structure the response in this exact format while addressing the audience as 'you':
    {
      "location": "Identify the communication channel or physical location. Examples:
        - Communication: Voxer, Email, Text, Phone Call
        - Social Media: Instagram, Twitter, LinkedIn, Facebook, TikTok, YouTube
        - Physical: Office, Conference, Lunch Meeting, Coffee Shop
        - Virtual: Zoom, Teams, Google Meet, Skype
        If not specified, return 'Not specified'",
      "names": ["Extract all names of people mentioned"],
      "nature": "Provide a clear, concise summary of the main points and purpose of the message, phrased in a way that speaks directly to the audience as 'you'. This should capture the essence of what was discussed or decided.",
      "followupDate": "Extract and convert any mentioned follow-up date to YYYY-MM-DD format. Examples:
        - If note says '2 weeks from now', calculate exact date from ${format(currentDate, 'MMMM d, yyyy')}
        - If note says 'next month', calculate first day of next month
        - If note says '2nd week of January', calculate that specific date
        - If note says 'in 3 days', calculate exact date
        Return null if no follow-up date is mentioned"
    }

    Important:
    - Location should focus on WHERE the interaction happened or will happen
    - For social media, specify the platform (e.g., 'Instagram DM', 'LinkedIn Message')
    - The nature field should be a comprehensive summary of the message content, phrased to engage 'you'.
    - For follow-up dates, calculate exact calendar dates regardless timezone using ${format(currentDate, 'MMMM d, yyyy')} as reference
    - Names should include both first and last names if mentioned
    - If multiple dates are mentioned, identify which one is specifically for follow-up
  `;

  // Please structure the response in this exact format:
  //   {
  //     "names": ["Extract all names of people mentioned, addressing them as 'you' where applicable"],
  //     "nature": "Provide a clear, concise summary of the main points and purpose of the message. This should capture the essence of what was discussed or decided.",
  //     - The nature field should be a comprehensive summary of the message content
  //   - Names should include both first and last names if mentioned, and address them as 'you' when relevant.

  try {
    const response = await fetch('/api/openai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt  }],
        openaiKey
      }),
    });

    if (!response.ok) {
      const {error} = await response.json()
      console.log(error)
      alert(error)
      throw new Error(error);
    }
    const stringArray = await response.text()
    const filterString = stringArray.replace(/```/g, '').replace(/json/g, '').trim();
    
    // const result = await response.json();
    const processed = JSON.parse(filterString);

    // Create and validate the processed note
    const processedNote: ProcessedNote = {
      text,
      timestamp: currentDate.toISOString(),
      location: processed.location,
      names: processed.names,
      nature: processed.nature,
      followupDate: processed.followupDate,
      tags: [],
    };

    return validateProcessedData(processedNote);
  } catch (error) {
    console.error('Error processing transcription:', error);
    throw new Error('Failed to process voice note. Please try again.');
  }
} 