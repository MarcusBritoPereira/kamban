import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, Subject } from 'rxjs';
import { AuthService } from './auth.service';

export interface SpaceMember {
  userId: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
}

export interface Space {
  id?: string;
  name: string;
  description?: string;
  owner_id?: string;
  members?: any[]; // Simplified for now, or use SpaceMember[] if backend returns it
  owner?: { name: string; email: string };
}

export interface Folder {
  id?: string;
  space_id: string;
  name: string;
}

export interface TaskList { // Renamed from List to avoid conflict
  id?: string;
  folder_id: string;
  name: string;
}

export interface Task {
  id?: string;
  list_id: string;
  title: string;
  description?: string;
  deadline?: string;
  status: 'todo' | 'doing' | 'done';
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private apiUrl = 'http://localhost:3000/v1';

  // Signals for state management
  spaces = signal<Space[]>([]);
  createSpaceDialogVisible = signal<boolean>(false);
  currentSpaceId = signal<string | null>(null);

  // Event bus for task updates
  private taskUpdatesSubject = new Subject<void>();
  taskUpdates$ = this.taskUpdatesSubject.asObservable();

  constructor(private http: HttpClient, private authService: AuthService) { }

  // Permissions Helpers
  canInvite(spaceId: string): boolean {
    const space = this.spaces().find(s => s.id === spaceId);
    if (!space) return false;

    const currentUser = this.authService.currentUser();
    if (!currentUser) return false;

    // Owner or Admin can invite
    if (space.owner_id === currentUser.id) return true;

    // Check members if present (assuming backend returns members with roles)
    // Note: backend 'members' structure: { user_id, role, ... }
    const member = space.members?.find((m: any) => m.user_id === currentUser.id);
    return member?.role === 'admin';
  }

  canDeleteSpace(spaceId: string): boolean {
    const space = this.spaces().find(s => s.id === spaceId);
    if (!space) return false;

    const currentUser = this.authService.currentUser();
    if (!currentUser) return false;

    // Only Owner can delete
    return space.owner_id === currentUser.id;
  }

  // Spaces
  getSpaces(): Observable<Space[]> {
    return this.http.get<Space[]>(`${this.apiUrl}/spaces`).pipe(
      tap(spaces => this.spaces.set(spaces))
    );
  }

  createSpace(data: Space): Observable<Space> {
    return this.http.post<Space>(`${this.apiUrl}/spaces`, data).pipe(
      tap(() => this.getSpaces().subscribe()) // Refresh list
    );
  }

  updateSpace(id: string, data: any): Observable<Space> {
    return this.http.put<Space>(`${this.apiUrl}/spaces/${id}`, data).pipe(
      tap(() => this.getSpaces().subscribe())
    );
  }

  addMember(spaceId: string, email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/spaces/${spaceId}/members`, { email });
  }

  // Placeholders
  getFolders(spaceId: string): Observable<Folder[]> {
    return this.http.get<Folder[]>(`${this.apiUrl}/spaces/${spaceId}/folders`);
  }

  createFolder(spaceId: string, data: any): Observable<Folder> {
    return this.http.post<Folder>(`${this.apiUrl}/spaces/${spaceId}/folders`, data);
  }

  updateFolder(id: string, data: any): Observable<Folder> {
    return this.http.put<Folder>(`${this.apiUrl}/folders/${id}`, data);
  }

  // Lists
  getLists(folderId: string): Observable<TaskList[]> {
    return this.http.get<TaskList[]>(`${this.apiUrl}/folders/${folderId}/lists`);
  }

  createList(folderId: string, data: any): Observable<TaskList> {
    return this.http.post<TaskList>(`${this.apiUrl}/folders/${folderId}/lists`, data);
  }

  updateList(id: string, data: any): Observable<TaskList> {
    return this.http.put<TaskList>(`${this.apiUrl}/lists/${id}`, data);
  }

  getList(id: string): Observable<TaskList> {
    return this.http.get<TaskList>(`${this.apiUrl}/lists/${id}`);
  }

  // Tasks
  getTasks(listId: string): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/lists/${listId}/tasks`);
  }

  createTask(listId: string, data: any): Observable<Task> {
    return this.http.post<Task>(`${this.apiUrl}/lists/${listId}/tasks`, { ...data, list_id: listId }).pipe(
      tap(() => this.taskUpdatesSubject.next())
    );
  }

  updateTask(taskId: string, data: any): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/tasks/${taskId}`, data).pipe(
      tap(() => this.taskUpdatesSubject.next())
    );
  }

  // Users (Admin)
  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users`);
  }

  updateUser(userId: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${userId}`, data);
  }

  deleteUser(userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${userId}`);
  }
}
