import { JournalEntry } from "@/types";
import { EmotionType } from "../parameters/emotions";

export const createURL = (path: string) => {
    return window.location.origin + path;
}

export const updatedEntry = async (id: string, content: string, personality: string, mood: EmotionType) => {
    try {
        const response = await fetch (new Request(`http://localhost:8000/api/entries/${id}/update/`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content, personality, mood }),
        }));

        if (response.ok) {
            const data = await response.json();
            console.log('Entry updated successfully:', data);
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

export const createNewEntry = async (content: string = "New entry") => {
    const res = await fetch(
        new Request('http://localhost:8000/api/entries/create/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content }),
        })
    );

    if (res.ok) {
        const data = await res.json();
        console.log('New entry data:', data);
        return data;
    } else {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create entry');
    }
};

export const deleteEntry = async (id: string) => {
    try {
        const res = await fetch(
            new Request(`http://localhost:8000/api/entries/${id}/delete/`, {
                method: 'DELETE',
            })
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



export const askQuestion = async (question: string, entries: JournalEntry[]) => {
    const res = await fetch(
        new Request('http://localhost:8001/qa', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                question,
                entries: entries.map(entry => ({
                    id: entry.id,
                    created_at: entry.created_at,
                    content: entry.content
                }))
            }),
        }),
    );

    if (res.ok) {
        const data = await res.json();
        return data.answer;
    }
};

export const generateDream = async (question: string) => {
    const res = await fetch(
        new Request('http://localhost:8001/generate-dream', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({theme: question}),
        })
    );

    if (res.ok) {
        const data = await res.json();
        console.log("data for dream ", data)
        return data.dream;
    };
};
