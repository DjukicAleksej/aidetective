
import { supabase } from './supabaseClient';
import { InvestigationCase, Suspect, Clue, TimelineEvent, Statement, Theory } from '../types';

export class DbService {

    async getCases(): Promise<InvestigationCase[]> {
        const { data, error } = await supabase
            .from('cases')
            .select(`
        *,
        parties:suspects(*),
        clues(*),
        timeline:timeline_events(*),
        statements(*),
        theories(*)
      `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Map database structure to InvestigationCase type
        return (data || []).map((c: any) => ({
            ...c,
            parties: (c.parties || []).map((p: any) => ({ ...p, imageUrl: p.image_url })),
            clues: (c.clues || []).map((cl: any) => ({
                ...cl,
                linkedSuspects: cl.linked_suspects
            })),
            timeline: (c.timeline || []).map((t: any) => ({
                ...t,
                involvedSuspects: t.involved_suspects,
                isGap: t.is_gap
            })),
            statements: (c.statements || []).map((s: any) => ({
                ...s,
                speakerName: s.speaker_name,
                speakerId: s.speaker_id
            })),
            theories: (c.theories || []).map((t: any) => ({
                ...t,
                linkedSuspects: t.linked_suspects,
                linkedClues: t.linked_clues
            })),
        })) as InvestigationCase[];
    }

    async createCase(caseData: Partial<InvestigationCase>): Promise<InvestigationCase> {
        const { data, error } = await supabase
            .from('cases')
            .insert([{
                title: caseData.title,
                description: caseData.description,
                status: caseData.status || 'Open',
                user_id: (await supabase.auth.getUser()).data.user?.id
            }])
            .select()
            .single();

        if (error) throw error;

        // Create initial empty arrays for related tables if needed
        // Or just return the basic case
        return {
            ...data,
            parties: [],
            clues: [],
            timeline: [],
            statements: [],
            theories: []
        } as InvestigationCase;
    }

    async updateCase(caseId: string, updates: Partial<InvestigationCase>): Promise<InvestigationCase> {
        const payload: any = {
            title: updates.title,
            description: updates.description,
            status: updates.status
        };
        Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

        const { data, error } = await supabase
            .from('cases')
            .update(payload)
            .eq('id', caseId)
            .select()
            .single();

        if (error) throw error;
        // Optimization: returns partial but we can merge with current state in UI or re-fetch
        return {
            ...data,
            parties: [], // We don't fetch relations here for performance, UI should merge
            clues: [],
            timeline: [],
            statements: [],
            theories: []
        } as InvestigationCase;
    }

    // Add more methods for updating cases, adding suspects, etc.
    async addSuspect(caseId: string, suspect: Partial<Suspect>): Promise<Suspect> {
        // Map frontend CamelCase to DB snake_case
        // Note: User requested ignoring imageUrl for now due to schema mismatch
        const payload = {
            case_id: caseId,
            name: suspect.name,
            role: suspect.role,
            description: suspect.description,
            motive: suspect.motive,
            alibi: suspect.alibi,
            notes: suspect.notes
            // image_url: suspect.imageUrl // Omitting as requested/schema missing
        };

        const { data, error } = await supabase
            .from('suspects')
            .insert([payload])
            .select()
            .single();

        if (error) throw error;

        return {
            ...data,
            imageUrl: data.image_url // valid even if null/undefined
        } as Suspect;
    }

    async addClue(caseId: string, clue: Partial<Clue>): Promise<Clue> {
        const { data, error } = await supabase
            .from('clues')
            .insert([{
                case_id: caseId,
                title: clue.title,
                description: clue.description,
                source: clue.source,
                confidence: clue.confidence,
                linked_suspects: clue.linkedSuspects || []
            }])
            .select()
            .single();
        if (error) throw error;
        return {
            ...data,
            linkedSuspects: data.linked_suspects
        } as Clue;
    }

    async addTimelineEvent(caseId: string, event: Partial<TimelineEvent>): Promise<TimelineEvent> {
        const { data, error } = await supabase
            .from('timeline_events')
            .insert([{
                case_id: caseId,
                time: event.time,
                description: event.description,
                involved_suspects: event.involvedSuspects || [],
                is_gap: event.isGap || false
            }])
            .select()
            .single();
        if (error) throw error;

        // Transform DB snake_case to CamelCase if not automatically handled, 
        // but assuming we might need manual mapping or the types/supabase client handles it.
        // For simplicity, let's just assert.
        // Actually, we should map involved_suspects (DB) to involvedSuspects (Type).
        return {
            ...data,
            involvedSuspects: data.involved_suspects,
            isGap: data.is_gap
        } as TimelineEvent;
    }

    async addStatement(caseId: string, statement: Partial<Statement>): Promise<Statement> {
        const { data, error } = await supabase
            .from('statements')
            .insert([{
                case_id: caseId,
                speaker_name: statement.speakerName,
                speaker_id: statement.speakerId,
                content: statement.content,
                timestamp: statement.timestamp || new Date().toISOString(),
                context: statement.context
            }])
            .select()
            .single();
        if (error) throw error;
        return {
            ...data,
            speakerName: data.speaker_name,
            speakerId: data.speaker_id
        } as Statement;
    }

    async addTheory(caseId: string, theory: Partial<Theory>): Promise<Theory> {
        const { data, error } = await supabase
            .from('theories')
            .insert([{
                case_id: caseId,
                title: theory.title,
                content: theory.content,
                linked_suspects: theory.linkedSuspects || [],
                linked_clues: theory.linkedClues || []
            }])
            .select()
            .single();
        if (error) throw error;
        return {
            ...data,
            linkedSuspects: data.linked_suspects,
            linkedClues: data.linked_clues
        } as Theory;
    }

    // --- Suspects ---
    async updateSuspect(suspectId: string, updates: Partial<Suspect>): Promise<Suspect> {
        const payload: any = {
            name: updates.name,
            role: updates.role,
            description: updates.description,
            motive: updates.motive,
            alibi: updates.alibi,
            notes: updates.notes
            // image_url: updates.imageUrl // Ignored as per previous instruction
        };
        // Remove undefined keys
        Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

        const { data, error } = await supabase
            .from('suspects')
            .update(payload)
            .eq('id', suspectId)
            .select()
            .single();

        if (error) throw error;
        return { ...data, imageUrl: data.image_url } as Suspect;
    }

    async deleteSuspect(suspectId: string): Promise<void> {
        const { error } = await supabase.from('suspects').delete().eq('id', suspectId);
        if (error) throw error;
    }

    // --- Clues ---
    async updateClue(clueId: string, updates: Partial<Clue>): Promise<Clue> {
        const payload: any = {
            title: updates.title,
            description: updates.description,
            source: updates.source,
            confidence: updates.confidence,
            linked_suspects: updates.linkedSuspects
        };
        Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

        const { data, error } = await supabase
            .from('clues')
            .update(payload)
            .eq('id', clueId)
            .select()
            .single();
        if (error) throw error;
        return {
            ...data,
            linkedSuspects: data.linked_suspects
        } as Clue;
    }

    async deleteClue(clueId: string): Promise<void> {
        const { error } = await supabase.from('clues').delete().eq('id', clueId);
        if (error) throw error;
    }

    // --- Timeline ---
    async updateTimelineEvent(eventId: string, updates: Partial<TimelineEvent>): Promise<TimelineEvent> {
        const payload: any = {
            time: updates.time,
            description: updates.description,
            involved_suspects: updates.involvedSuspects,
            is_gap: updates.isGap
        };
        Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

        const { data, error } = await supabase
            .from('timeline_events')
            .update(payload)
            .eq('id', eventId)
            .select()
            .single();
        if (error) throw error;

        return {
            ...data,
            involvedSuspects: data.involved_suspects,
            isGap: data.is_gap
        } as TimelineEvent;
    }

    async deleteTimelineEvent(eventId: string): Promise<void> {
        const { error } = await supabase.from('timeline_events').delete().eq('id', eventId);
        if (error) throw error;
    }

    // --- Statements ---
    async updateStatement(statementId: string, updates: Partial<Statement>): Promise<Statement> {
        const payload: any = {
            speaker_name: updates.speakerName,
            speaker_id: updates.speakerId,
            content: updates.content,
            timestamp: updates.timestamp,
            context: updates.context
        };
        Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

        const { data, error } = await supabase
            .from('statements')
            .update(payload)
            .eq('id', statementId)
            .select()
            .single();
        if (error) throw error;

        return {
            ...data,
            speakerName: data.speaker_name,
            speakerId: data.speaker_id
        } as Statement;
    }

    async deleteStatement(statementId: string): Promise<void> {
        const { error } = await supabase.from('statements').delete().eq('id', statementId);
        if (error) throw error;
    }

    // --- Theories ---
    async updateTheory(theoryId: string, updates: Partial<Theory>): Promise<Theory> {
        const payload: any = {
            title: updates.title,
            content: updates.content,
            linked_suspects: updates.linkedSuspects,
            linked_clues: updates.linkedClues
        };
        Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

        const { data, error } = await supabase
            .from('theories')
            .update(payload)
            .eq('id', theoryId)
            .select()
            .single();
        if (error) throw error;

        return {
            ...data,
            linkedSuspects: data.linked_suspects,
            linkedClues: data.linked_clues
        } as Theory;
    }

    async deleteTheory(theoryId: string): Promise<void> {
        const { error } = await supabase.from('theories').delete().eq('id', theoryId);
        if (error) throw error;
    }
}

export const dbService = new DbService();
