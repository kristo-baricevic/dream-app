import { apiFetch } from '@/services/apiFetch';
import { captureSourceReset, SourceResetTicket, sourceMutationFields } from '@/lib/sourceResetGuard';
import { JournalEntry } from '@/types';
import { EmotionType } from '../parameters/emotions';
import { getPersonality } from '../parameters/personalities';
import { Settings } from '@/redux/slices/settingsSlice';

export const createURL = (path: string) => {
  return window.location.origin + path;
};

const local = false;

const API_URL = '';
const FAST_API_URL = '/fastapi';

export const updatedEntry = async (
  id: string,
  content: string,
  // personality: string,
  mood: EmotionType,
  settings: Settings,
  preimage?: JournalEntry['source_preimage'],
) => {
  const ticket = await captureSourceReset(preimage, 'update');
  if (!ticket) throw new Error('Source update cancelled.');
  try {
    const response = await apiFetch(
      `${API_URL}/api/entries/${id}/update/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Dream-Principal': ticket.expected_principal,
        },
        body: JSON.stringify({ content, mood, settings, ...sourceMutationFields(ticket), source_origin: 'unknown' }),
      }
    );

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      const errorData = await response.json();
      console.error('Failed to update entry:', errorData);
      throw new Error('Failed to update entry');
    }
  } catch (error) {
    console.error('Error updating entry:', error);
    throw error;
  }
};

export const createNewEntry = async (content: string = 'New entry') => {
  const res = await apiFetch(
    `${API_URL}/api/entries/create/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    }
  );

  if (res.ok) {
    const data = await res.json();
    return data;
  } else {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to create entry');
  }
};

export const deleteEntry = async (id: string, ticket: SourceResetTicket) => {
  try {
    const res = await apiFetch(
      `${API_URL}/api/entries/${id}/delete/`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'X-Dream-Principal': ticket.expected_principal },
        body: JSON.stringify(sourceMutationFields(ticket)),
      }
    );

    if (res.ok) {
      return 'Entry deleted successfully';
    } else {
      const errorText = await res.text();
      console.error(`Failed to delete entry. Status: ${res.status}, Message: ${errorText}`);
      throw new Error(`Failed to delete entry. Status: ${res.status}, Message: ${errorText}`);
    }
  } catch (error) {
    console.error('Error deleting entry:', error);
    throw error;
  }
};

export const askQuestion = async (
  entries: JournalEntry[],
  settings: Settings
  // personality: string = 'academic'
) => {
  const personalityPrompt = getPersonality(settings.doctorPersonality);
  const URL = local ? `${FAST_API_URL}/qa` : `${API_URL}/fastapi/qa`;

  const res = await apiFetch(
    URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        entries: entries.map((entry) => ({
          id: entry.id,
          created_at: entry.created_at,
          content: entry.content,
        })),
        personality: personalityPrompt,
        settings: settings,
      }),
    }
  );

  if (res.ok) {
    const data = await res.json();
    return data.answer;
  }
};

export const generateDream = async (question: string) => {
  const URL = local ? `${FAST_API_URL}/generate-dream` : `${API_URL}/fastapi/generate-dream`;

  const res = await apiFetch(
    URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ theme: question }),
    }
  );

  if (res.ok) {
    const data = await res.json();
    return data.dream;
  }
};

export const askCustomQuestion = async (
  question: string,
  entries: JournalEntry[],
  settings: Settings,
  ) => {
  const personalityPrompt = getPersonality(settings.doctorPersonality);
  const URL = local ? `${FAST_API_URL}/custom-question` : `${API_URL}/fastapi/custom-question`;

  const res = await apiFetch(
    URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question,
        entries,
        personality: personalityPrompt,
        settings: settings
      }),
    }
  );

  if (res.ok) {
    const data = await res.json();
    return data.answer;
  }
};


