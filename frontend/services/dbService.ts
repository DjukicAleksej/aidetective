
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
            clues: c.clues || [],
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
                confidence: clue.confidence
            }])
            .select()
            .single();
        if (error) throw error;
        return data as Clue;
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
}

export const dbService = new DbService();
