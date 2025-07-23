// API Client for Career Center Admin Dashboard

class ApiClient {
    constructor() {
        this.baseUrl = '/api';
        this.token = localStorage.getItem('authToken');
    }

    // Set auth token
    setToken(token) {
        this.token = token;
        localStorage.setItem('authToken', token);
    }

    // Clear auth token
    clearToken() {
        this.token = null;
        localStorage.removeItem('authToken');
    }

    // Generic request method
    async request(url, options = {}) {
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(`${this.baseUrl}${url}`, {
                ...options,
                headers
            });

            if (response.status === 401) {
                // Token expired or invalid
                this.clearToken();
                window.location.href = '/admin-login.html';
                return;
            }

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API request error:', error);
            throw error;
        }
    }

    // Auth endpoints
    async login(username, password) {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            this.setToken(data.token);
        }
        
        return { response, data };
    }

    // Dashboard stats
    async getStats() {
        return this.request('/admin/stats');
    }

    // Ambassador endpoints
    async getAmbassadors() {
        return this.request('/ambassadors');
    }

    async getAmbassador(id) {
        return this.request(`/ambassadors/${id}`);
    }

    async createAmbassador(data, imageFile = null) {
        if (imageFile) {
            const formData = new FormData();
            formData.append('image', imageFile);
            
            // Append other data
            Object.keys(data).forEach(key => {
                if (Array.isArray(data[key])) {
                    formData.append(key, JSON.stringify(data[key]));
                } else {
                    formData.append(key, data[key]);
                }
            });
            
            return this.request('/ambassadors', {
                method: 'POST',
                body: formData,
                headers: {} // Let browser set Content-Type for FormData
            });
        }
        
        return this.request('/ambassadors', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async updateAmbassador(id, data, imageFile = null) {
        if (imageFile) {
            const formData = new FormData();
            formData.append('image', imageFile);
            
            // Append other data
            Object.keys(data).forEach(key => {
                if (Array.isArray(data[key])) {
                    formData.append(key, JSON.stringify(data[key]));
                } else {
                    formData.append(key, data[key]);
                }
            });
            
            return this.request(`/ambassadors/${id}`, {
                method: 'PUT',
                body: formData,
                headers: {} // Let browser set Content-Type for FormData
            });
        }
        
        return this.request(`/ambassadors/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async deleteAmbassador(id) {
        return this.request(`/ambassadors/${id}`, {
            method: 'DELETE'
        });
    }

    // Event endpoints
    async getEvents(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/events${queryString ? '?' + queryString : ''}`);
    }

    async getEvent(id) {
        return this.request(`/events/${id}`);
    }

    async createEvent(data) {
        return this.request('/events', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async updateEvent(id, data) {
        return this.request(`/events/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async deleteEvent(id) {
        return this.request(`/events/${id}`, {
            method: 'DELETE'
        });
    }

    async getEventStats(id) {
        return this.request(`/events/${id}/stats`);
    }

    // Registration endpoints
    async getRegistrations(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/registrations${queryString ? '?' + queryString : ''}`);
    }

    async getRegistration(id) {
        return this.request(`/registrations/${id}`);
    }

    async updateRegistration(id, data) {
        return this.request(`/registrations/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async deleteRegistration(id) {
        return this.request(`/registrations/${id}`, {
            method: 'DELETE'
        });
    }

    async bulkUpdateRegistrations(registrationIds, status) {
        return this.request('/registrations/bulk-update', {
            method: 'POST',
            body: JSON.stringify({ registration_ids: registrationIds, status })
        });
    }

    // Message endpoints
    async getMessages(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/messages${queryString ? '?' + queryString : ''}`);
    }

    async getMessage(id) {
        return this.request(`/messages/${id}`);
    }

    async updateMessage(id, data) {
        return this.request(`/messages/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async deleteMessage(id) {
        return this.request(`/messages/${id}`, {
            method: 'DELETE'
        });
    }

    async getMessageStats() {
        return this.request('/messages/stats/overview');
    }
    
    // Cohort endpoints
    async getCohorts() {
        return this.request('/cohorts');
    }
    
    async getCohort(year) {
        return this.request(`/cohorts/${year}`);
    }
    
    async createCohort(data) {
        return this.request('/cohorts', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
    
    async updateCohort(year, data) {
        return this.request(`/cohorts/${year}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }
    
    // Application endpoints
    async getApplications(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/applications${queryString ? '?' + queryString : ''}`);
    }
    
    async getApplication(id) {
        return this.request(`/applications/${id}`);
    }
    
    async updateApplication(id, data) {
        return this.request(`/applications/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }
}

// Create global instance
window.apiClient = new ApiClient();