import { Task } from '@/types/task';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

class ApiClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    try {
      console.log(`DEBUG API: Sending ${config.method || 'GET'} to ${url}`);
      const response = await fetch(url, config);
      console.log(`DEBUG API: Received status ${response.status} from ${url}`);

      if (response.status === 401) {
        // Handle unauthorized access - maybe redirect to login
        console.error('Unauthorized access - token may have expired');
        // In a real app, you might want to redirect to login
        // router.push('/login');
        throw new Error('Unauthorized: Please log in again');
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return null;
      }

      const text = await response.text();
      return text ? JSON.parse(text) : null;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Task-related methods
  async getTasks(): Promise<Task[]> {
    return this.request(`/tasks/?t=${Date.now()}`);
  }

  async createTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    return this.request('/tasks/', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }

  async updateTask(id: string, taskData: Partial<Task>): Promise<Task> {
    return this.request(`/tasks/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
  }

  async deleteTask(id: string): Promise<void> {
    await this.request(`/tasks/${id}/`, {
      method: 'DELETE',
    });
  }

  async toggleTaskCompletion(id: string): Promise<Task> {
    return this.request(`/tasks/${id}/complete/`, {
      method: 'PATCH',
    });
  }

  // Chat-related methods
  async chat(message: string, conversation_id?: string): Promise<{ response: string; conversation_id: string }> {
    return this.request('/chat/', {
      method: 'POST',
      body: JSON.stringify({ message, conversation_id }),
    });
  }

  async getChatHistory(conversation_id: string): Promise<any[]> {
    return this.request(`/chat/history/${conversation_id}/`);
  }
}

export const apiClient = new ApiClient();