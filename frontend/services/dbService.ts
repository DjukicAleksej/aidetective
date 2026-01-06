
import { InvestigationCase, Suspect, Clue, TimelineEvent, Statement, Theory } from '../types';

const API_URL = "https://acd4725c4ea3.ngrok-free.app";

class DbService {

    private async fetchJson(endpoint: string, options: RequestInit = {}) {
        const res = await fetch(`${API_URL}${endpoint}`, options);
        if (!res.ok) {
            const text = await res.text();
            throw new Error(`API error: ${res.status} ${res.statusText} - ${text}`);
        }
        return res.json();
    }

    async getCases(): Promise<InvestigationCase[]> {
        const cases = await this.fetchJson('/api/cases');
        // Fetch details for each case
        return Promise.all(cases.map(async (c: any) => {
            return this.getCaseDetails(c);
        }));
    }

    private async getCaseDetails(c: any): Promise<InvestigationCase> {
        const headers = { 'Content-Type': 'application/json' };
        const body = JSON.stringify({ caseid: c.id });

        const [parties, evidences, theories, timelines] = await Promise.all([
            this.fetchJson('/api/parties', { method: 'POST', body, headers }),
            this.fetchJson('/api/evidences', { method: 'POST', body, headers }),
            this.fetchJson('/api/theories', { method: 'POST', body, headers }),
            this.fetchJson('/api/timelines', { method: 'POST', body, headers }),
        ]);

        return {
            id: c.id,
            title: c.name,
            description: c.short_description || '',
            status: 'Open',
            parties: Object.entries(parties).map(([id, p]: [string, any]) => ({
                id,
                name: p.name,
                role: p.role,
                description: p.description || '',
                alibi: p.alibi || '',
                motive: '',
                notes: '',
                imageUrl: p.image && p.image.startsWith('/api') ? `${API_URL}${p.image}` : p.image
            })),
            clues: (evidences as any[]).map(e => ({
                id: e.id,
                title: e.name,
                description: e.description || '',
                source: e.place || '',
                confidence: e.status as 'Confirmed' | 'Questionable' | 'Disputed' || 'Questionable',
                linkedSuspects: e.suspects || []
            })),
            timeline: (timelines as any[]).map(t => ({
                id: t.id,
                time: t.name, // Mapping 'name' to 'time' string
                description: t.description || '',
                involvedSuspects: [], // Backend doesn't support this
                isGap: false // Backend doesn't support this
            })),
            theories: Object.entries(theories).map(([id, t]: [string, any]) => ({
                id,
                title: t.name,
                content: t.content,
                linkedClues: [],
                linkedSuspects: []
            })),
            statements: [] // Not supported by backend
        };
    }

    async createCase(caseData: Partial<InvestigationCase>): Promise<InvestigationCase> {
        const res = await this.fetchJson('/api/cases', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: caseData.title || 'New Case',
                short_description: caseData.description || ''
            })
        });
        // We need to return the full case object.
        // We can just construct a basic one since it's new.
        return {
            id: res.id,
            title: caseData.title || 'New Case',
            description: caseData.description || '',
            status: 'Open',
            parties: [],
            clues: [],
            timeline: [],
            statements: [],
            theories: []
        };
    }

    async updateCase(caseId: string, updates: Partial<InvestigationCase>): Promise<InvestigationCase> {
        await this.fetchJson(`/api/cases?case_id=${caseId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: updates.title,
                short_description: updates.description
            })
        });
        // Return updated object (approximated)
        return {
            id: caseId,
            ...updates
        } as InvestigationCase;
    }

    async deleteCase(caseId: string): Promise<void> {
        await this.fetchJson('/api/cases', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ caseid: caseId })
        });
    }

    // --- Suspects ---
    async addSuspect(caseId: string, suspect: Partial<Suspect>): Promise<Suspect> {
        const id = await this.fetchJson('/api/parties', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                caseid: caseId,
                name: suspect.name,
                role: suspect.role,
                description: suspect.description,
                alibi: suspect.alibi
            })
        });

        // Handle Image Upload if needed?
        // Backend has /api/parties/{id}/image POST for upload.
        // But suspect.imageUrl is string. If it's a blob URL we might need to upload.
        // For now, ignore image upload in addSuspect.

        return {
            ...suspect,
            id: id,
            motive: '',
            notes: '',
            imageUrl: ''
        } as Suspect;
    }

    async updateSuspect(suspectId: string, updates: Partial<Suspect>): Promise<Suspect> {
        await this.fetchJson('/api/parties', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                partyid: suspectId,
                name: updates.name,
                role: updates.role,
                description: updates.description,
                alibi: updates.alibi
            })
        });
        return { id: suspectId, ...updates } as Suspect;
    }

    async deleteSuspect(suspectId: string): Promise<void> {
        await this.fetchJson('/api/parties', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: suspectId })
        });
    }

    async uploadSuspectImage(suspectId: string, file: File): Promise<void> {
        const formData = new FormData();
        formData.append('file', file);

        await fetch(`${API_URL}/api/parties/${suspectId}/image`, {
            method: 'POST',
            body: formData,
        });
    }

    // --- Clues (Evidences) ---
    async addClue(caseId: string, clue: Partial<Clue>): Promise<Clue> {
        const id = await this.fetchJson('/api/evidences', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                caseid: caseId,
                name: clue.title,
                description: clue.description,
                place: clue.source, // Mapping source -> place
                status: clue.confidence, // Mapping confidence -> status
                suspects: clue.linkedSuspects
            })
        });
        return { id, ...clue } as Clue;
    }

    async updateClue(clueId: string, updates: Partial<Clue>): Promise<Clue> {
        await this.fetchJson('/api/evidences', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: clueId,
                name: updates.title,
                description: updates.description,
                place: updates.source,
                status: updates.confidence,
                suspects: updates.linkedSuspects
            })
        });
        return { id: clueId, ...updates } as Clue;
    }

    async deleteClue(clueId: string): Promise<void> {
        await this.fetchJson('/api/evidences', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: clueId })
        });
    }

    // --- Timeline ---
    async addTimelineEvent(caseId: string, event: Partial<TimelineEvent>): Promise<TimelineEvent> {
        const id = await this.fetchJson('/api/timelines', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                caseid: caseId,
                timestamp: Date.now(), // Dummy timestamp
                name: event.time, // Mapping time -> name
                description: event.description,
                place: 'unknown',
                status: 'active'
            })
        });
        return { id, ...event, involvedSuspects: [] } as TimelineEvent;
    }

    async updateTimelineEvent(eventId: string, updates: Partial<TimelineEvent>): Promise<TimelineEvent> {
        await this.fetchJson('/api/timelines', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: eventId,
                name: updates.time,
                description: updates.description
            })
        });
        return { id: eventId, ...updates } as TimelineEvent;
    }

    async deleteTimelineEvent(eventId: string): Promise<void> {
        await this.fetchJson('/api/timelines', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: eventId })
        });
    }

    // --- Theories ---
    async addTheory(caseId: string, theory: Partial<Theory>): Promise<Theory> {
        const id = await this.fetchJson('/api/theories', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                caseid: caseId,
                name: theory.title,
                content: theory.content
            })
        });
        return { id, ...theory, linkedClues: [], linkedSuspects: [] } as Theory;
    }

    async updateTheory(theoryId: string, updates: Partial<Theory>): Promise<Theory> {
        await this.fetchJson('/api/theories', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: theoryId,
                name: updates.title,
                content: updates.content
            })
        });
        return { id: theoryId, ...updates } as Theory;
    }

    async deleteTheory(theoryId: string): Promise<void> {
        await this.fetchJson('/api/theories', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: theoryId })
        });
    }

    // --- Statements (Mocked) ---
    async addStatement(caseId: string, statement: Partial<Statement>): Promise<Statement> {
        console.warn("Statements are not supported by the new backend.");
        return { id: 'mock-id-' + Date.now(), ...statement } as Statement;
    }

    async updateStatement(statementId: string, updates: Partial<Statement>): Promise<Statement> {
        console.warn("Statements are not supported by the new backend.");
        return { id: statementId, ...updates } as Statement;
    }

    async deleteStatement(statementId: string): Promise<void> {
        console.warn("Statements are not supported by the new backend.");
    }
}

export const dbService = new DbService();
