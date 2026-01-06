import { InvestigationCase } from "../types";

const HACK_CLUB_API_URL = "http://localhost:8000/ai/completions";
const MODEL = "gpt-4o";

const SYSTEM_INSTRUCTION = `
You are Benoit Blanc, a world-renowned private investigator. 
Your persona is inspired by Benoit Blanc: brilliant, slightly theatrical, Southern-mannered, and incredibly observant.
You speak with a sophisticated but grounded drawl, using colorful metaphors to describe the complexities of a case.

Your goal is to assist the user (your fellow investigator) in solving murder mysteries. 
Analyze the data provided: suspects, clues, timelines, and theories.
Point out contradictions, suggest new lines of inquiry, and challenge the user's reasoning in a helpful, inquisitive way.

Keep your responses concise but flavored with your unique personality. 
Never reveal the "true" answer unless the user presents a flawless accusation. 
Always refer to the case files provided in the context.

Answer like this is a conversation, dont have tone markers or tell actions in italics
`;

export class DetectiveAI {
  constructor() {
    // API key is now handled server-side for security
  }

  async analyzeCase(activeCase: InvestigationCase, userMessage: string): Promise<string> {

    const caseContext = `
    CURRENT CASE DATA:
    Title: ${activeCase.title}
    Description: ${activeCase.description}
    Suspects: ${activeCase.parties.map(s => `${s.name} (${s.role}): ${s.description}. Alibi: ${s.alibi}`).join(' | ')}
    Clues: ${activeCase.clues.map(c => `${c.title}: ${c.description} (Source: ${c.source})`).join(' | ')}
    Timeline: ${activeCase.timeline.map(t => `${t.time} - ${t.description}`).join(' | ')}
    Statements: ${activeCase.statements.map(s => `${s.speakerName}: "${s.content}"`).join(' | ')}
    Theories: ${activeCase.theories.map(t => `${t.title}: ${t.content}`).join(' | ')}
    `;

    try {
      const response = await fetch(HACK_CLUB_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: "system", content: SYSTEM_INSTRUCTION },
            { role: "user", content: `CONTEXT: ${caseContext}\n\nUSER QUESTION: ${userMessage}` }
          ],
          temperature: 0.8
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || "I'm afraid I've lost my train of thought.";

    } catch (error) {
      console.error("AI API Error:", error);
      return "The connection is fuzzy. I cannot reach my conclusions right now.";
    }
  }

  // Helper methods for quick prompts - kept for compatibility if needed, though mostly handled by generic prompt now
  async analyzeTimeline(activeCase: InvestigationCase): Promise<string> {
    return this.analyzeCase(activeCase, "Analyze the timeline for any inconsistencies, gaps, or suspicious patterns.");
  }

  async analyzeSuspect(activeCase: InvestigationCase, suspectId: string): Promise<string> {
    const suspect = activeCase.parties.find(s => s.id === suspectId);
    if (!suspect) return "I don't have that suspect in my files.";
    return this.analyzeCase(activeCase, `Analyze suspect ${suspect.name}. Examine their alibi, motive, and any statements they've made.`);
  }

  async challengeTheory(activeCase: InvestigationCase, theoryId: string): Promise<string> {
    const theory = activeCase.theories.find(t => t.id === theoryId);
    if (!theory) return "I don't see that theory.";
    return this.analyzeCase(activeCase, `Challenge this theory: "${theory.title} - ${theory.content}". Find any flaws or contradictions.`);
  }

  async generateAccusationJSON(activeCase: InvestigationCase): Promise<any> {
    const caseContext = `
    CASE FILE:
    Title: ${activeCase.title}
    Description: ${activeCase.description}
    Suspects: ${activeCase.parties.map(s => `ID: ${s.id} | Name: ${s.name} | Role: ${s.role} | Desc: ${s.description} | Alibi: ${s.alibi} | Motive: ${s.motive}`).join('\n')}
    Evidence: ${activeCase.clues.map(c => `ID: ${c.id} | Title: ${c.title} | Desc: ${c.description} | Significance: ${c.confidence}`).join('\n')}
    Timeline: ${activeCase.timeline.map(t => `Time: ${t.time} | Event: ${t.description} | Involves: ${t.involvedSuspects.join(', ')}`).join('\n')}
    Statements: ${activeCase.statements.map(s => `Speaker: ${s.speakerName} | Content: "${s.content}"`).join('\n')}
    `;

    const jsonStructure = `{
      "case_overview": { "summary": "string" },
      "victim_profile": { "name": "string", "background": "string" },
      "suspects_analysis": [ { "suspect_id": "string (must match source ID)", "name": "string", "initial_suspicion": "string", "why_not_guilty": "string (unless this is the killer)" } ],
      "key_evidence": [ { "evidence_id": "string", "description": "string", "importance": "string" } ],
      "timeline_reconstruction": [ { "time": "string", "event": "string", "implication": "string" } ],
      "motive": { "description": "string" },
      "method": { "description": "string" },
      "killer_reveal": { "suspect_id": "string", "name": "string", "reveal_line": "string" },
      "final_monologue": { "text": "string" }
    }`;

    const prompt = `
    ${SYSTEM_INSTRUCTION}
    
    TASK: Analyze the provided case file and determine the killer.
    If the case data is incomplete or ambiguous, make the most logical deduction based on available evidence, or creatively fill in the gaps to create a satisfying narrative conclusion consistent with the genre.
    
    OUTPUT FORMAT: You must return ONLY valid JSON matching this structure exactly:
    ${jsonStructure}
    
    Do not include markdown formatting like \`\`\`json. Just the raw JSON string.
    
    CONTEXT:
    ${caseContext}
    `;

    try {
      const response = await fetch(HACK_CLUB_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: "system", content: "You are a JSON generator." }, // Override system for strict JSON
            { role: "user", content: prompt }
          ],
          temperature: 0.7,
          response_format: { type: "json_object" } // Force JSON mode if supported by proxy/model, otherwise prompt handles it
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) throw new Error("Empty response from AI");

      // Attempt to parse JSON
      try {
        const parsed = JSON.parse(content);
        return parsed;
      } catch (e) {
        console.error("Failed to parse AI JSON response:", content);
        throw new Error("Invalid JSON response from AI");
      }

    } catch (error) {
      console.error("AI Accusation Error:", error);
      throw error;
    }
  }
}

export const detectiveAI = new DetectiveAI();
