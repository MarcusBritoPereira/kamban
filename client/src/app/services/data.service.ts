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
  folder?: any;
}

export interface Task {
  id?: string;
  list_id: string;
  title: string;
  description?: string;
  deadline?: string;
  status: 'todo' | 'doing' | 'done' | 'planned' | 'in_review' | 'approved' | 'rejected' | 'waiting';
  priority?: 'urgent' | 'high' | 'normal' | 'low';
  tags?: any[]; // Simplified for now
  list?: {
    id?: string;
    name: string;
    folder?: { id?: string; name: string; space_id: string; space?: { id?: string; name: string } };
  };
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

  deleteSpace(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/spaces/${id}`).pipe(
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

  deleteFolder(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/folders/${id}`);
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

  deleteList(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/lists/${id}`);
  }

  getList(id: string): Observable<TaskList> {
    return this.http.get<TaskList>(`${this.apiUrl}/lists/${id}`);
  }

  // Tasks
  getListTasks(listId: string, page: number = 1, limit: number = 20): Observable<{ data: Task[], meta: any }> {
    return this.http.get<{ data: Task[], meta: any }>(`${this.apiUrl}/tasks?list_id=${listId}&page=${page}&limit=${limit}`);
  }

  getMyTasks(page: number = 1, limit: number = 20): Observable<{ data: Task[], meta: any }> {
    return this.http.get<{ data: Task[], meta: any }>(`${this.apiUrl}/tasks/me?page=${page}&limit=${limit}`);
  }

  getUserTasks(userId: string, page: number = 1, limit: number = 50): Observable<{ data: Task[], meta: any }> {
    return this.http.get<{ data: Task[], meta: any }>(`${this.apiUrl}/tasks/user/${userId}?page=${page}&limit=${limit}`);
  }

  getSpaceMembers(spaceId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/spaces/${spaceId}/members`);
  }

  createTask(listId: string, data: any): Observable<Task> {
    const payload = { ...data, list_id: listId };
    return this.http.post<Task>(`${this.apiUrl}/tasks`, payload).pipe(
      tap(() => this.taskUpdatesSubject.next())
    );
  }

  updateTask(taskId: string, data: any): Observable<Task> {
    return this.http.patch<Task>(`${this.apiUrl}/tasks/${taskId}`, data).pipe(
      tap(() => this.taskUpdatesSubject.next())
    );
  }

  deleteTask(taskId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/tasks/${taskId}`).pipe(
      tap(() => this.taskUpdatesSubject.next())
    );
  }

  getTask(taskId: string): Observable<Task> {
    return this.http.get<Task>(`${this.apiUrl}/tasks/${taskId}`);
  }

  uploadAttachment(taskId: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/tasks/${taskId}/attachments`, formData);
  }

  deleteAttachment(attachmentId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/attachments/${attachmentId}`);
  }

  // Notifications
  getNotifications(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/notifications`);
  }

  markNotificationAsRead(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/notifications/${id}/read`, {});
  }

  markAllNotificationsAsRead(): Observable<any> {
    return this.http.patch(`${this.apiUrl}/notifications/read-all`, {});
  }

  // Users (Admin)
  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users`);
  }

  getDirectory(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users/directory`);
  }

  updateUser(userId: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${userId}`, data);
  }

  deleteUser(userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${userId}`);
  }

  // Companies
  getCompanies(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/companies`);
  }

  getCompany(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/companies/${id}`);
  }

  createCompany(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/companies`, data);
  }

  updateCompany(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/companies/${id}`, data);
  }

  deleteCompany(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/companies/${id}`);
  }

  addCompanyMember(companyId: string, userId: string, role: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/companies/${companyId}/members`, { userId, role });
  }

  removeCompanyMember(companyId: string, userId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/companies/${companyId}/members/${userId}`);
  }

  uploadAvatar(userId: string, file: File): Observable<{ avatar_url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ avatar_url: string }>(`${this.apiUrl}/users/${userId}/avatar`, formData);
  }

  // Tags
  getSpaceTags(spaceId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/spaces/${spaceId}/tags`);
  }

  createTag(spaceId: string, data: { name: string, color: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/spaces/${spaceId}/tags`, data);
  }

  updateTag(tagId: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/tags/${tagId}`, data);
  }

  deleteTag(tagId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/tags/${tagId}`);
  }

  addTagToTask(taskId: string, data: { name: string, color: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/tasks/${taskId}/tags`, data);
  }

  removeTagFromTask(taskId: string, tagId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/tasks/${taskId}/tags/${tagId}`);
  }

  // Activities
  getTaskActivities(taskId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/tasks/${taskId}/activities`);
  }

  addTaskComment(taskId: string, content: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/tasks/${taskId}/comments`, { content });
  }

  // Dashboard
  getDashboardMetrics(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/dashboard/metrics`);
  }

  getProductionMetrics(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/dashboard/production`);
  }
}
