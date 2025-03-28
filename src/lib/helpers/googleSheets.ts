import { CustomTag } from '../types/tags';

interface SheetData {
  timestamp: string;
  text: string;
  location: string;
  names: string[];
  nature: string;
  followupDate: string | null;
  tags: CustomTag[];
}

export async function exportToGoogleSheets(data: SheetData, sheetId: string) {
  console.log("data: ", data)
  try {
    const response = await fetch('/api/google/sheets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          spreadSheetId: sheetId,
          timestamp: new Date(data.timestamp).toLocaleString(),
          location: data.location,
          names: data.names.join(', '),
          nature: data.nature,
          followupDate: data.followupDate 
            ? new Date(data.followupDate).toLocaleDateString() 
            : 'No follow-up',
          tags: data.tags.map(tag => tag.name).join(', ')
        }
      }),
    });
    console.log("Get response")

    if (!response.ok) {
      throw new Error('Failed to export to Google Sheets');
    }

    return await response.json();
  } catch (error) {
    console.error('Error exporting to Google Sheets:', error);
    throw error;
  }
} 