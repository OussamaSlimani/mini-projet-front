import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Agent } from "../models/Agent";

@Injectable({
  providedIn: "root",
})
export class AgentService {
  private apiUrl = "http://localhost:8080/api/v1";

  constructor(private http: HttpClient) {}

  getAllAgents(): Observable<Agent[]> {
    return this.http.get<Agent[]>(`${this.apiUrl}/agents`);
  }

  getActiveAgents(): Observable<Agent[]> {
    return this.http.get<Agent[]>(`${this.apiUrl}/agents/active`);
  }

  getAgentById(userId: string): Observable<Agent> {
    return this.http.get<Agent>(`${this.apiUrl}/${userId}`);
  }

  createAgent(agent: Agent): Observable<Agent> {
    return this.http.post<Agent>(`${this.apiUrl}/agent`, agent);
  }

  updateAgent(userId: string, agent: Partial<Agent>): Observable<Agent> {
    return this.http.put<Agent>(`${this.apiUrl}/${userId}`, agent);
  }

  deleteAgent(userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${userId}`);
  }
}
