import { InvestigationCase, Suspect, Clue, TimelineEvent, Statement, Theory } from '../types';

const API_BASE_URL = 'https://acd4725c4ea3.ngrok-free.app';

export class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async fetchCases(): Promise<InvestigationCase[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/get_cases`);
      if (!response.ok) throw new Error('Failed to fetch cases');
      return await response.json();
    } catch (error) {
      console.error('Error fetching cases:', error);
      throw error;
    }
  }

  async fetchCase(caseId: string): Promise<InvestigationCase> {
    try {
      const response = await fetch(`${this.baseUrl}/api/get_cases/${caseId}`);
      if (!response.ok) throw new Error('Failed to fetch case');
      return await response.json();
    } catch (error) {
      console.error('Error fetching case:', error);
      throw error;
    }
  }

  async fetchparties(caseId: string): Promise<Suspect[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/get_cases/${caseId}/parties`);
      if (!response.ok) throw new Error('Failed to fetch parties');
      return await response.json();
    } catch (error) {
      console.error('Error fetching parties:', error);
      throw error;
    }
  }

  async fetchClues(caseId: string): Promise<Clue[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/get_cases/${caseId}/clues`);
      if (!response.ok) throw new Error('Failed to fetch clues');
      return await response.json();
    } catch (error) {
      console.error('Error fetching clues:', error);
      throw error;
    }
  }

  async fetchTimeline(caseId: string): Promise<TimelineEvent[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/get_cases/${caseId}/timeline`);
      if (!response.ok) throw new Error('Failed to fetch timeline');
      return await response.json();
    } catch (error) {
      console.error('Error fetching timeline:', error);
      throw error;
    }
  }

  async fetchStatements(caseId: string): Promise<Statement[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/get_cases/${caseId}/statements`);
      if (!response.ok) throw new Error('Failed to fetch statements');
      return await response.json();
    } catch (error) {
      console.error('Error fetching statements:', error);
      throw error;
    }
  }

  async fetchTheories(caseId: string): Promise<Theory[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/get_cases/${caseId}/theories`);
      if (!response.ok) throw new Error('Failed to fetch theories');
      return await response.json();
    } catch (error) {
      console.error('Error fetching theories:', error);
      throw error;
    }
  }

  async updateCase(caseId: string, updates: Partial<InvestigationCase>): Promise<InvestigationCase> {
    try {
      const response = await fetch(`${this.baseUrl}/api/get_cases/${caseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update case');
      return await response.json();
    } catch (error) {
      console.error('Error updating case:', error);
      throw error;
    }
  }
}

export const apiService = new ApiService();

