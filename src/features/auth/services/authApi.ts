import axiosClient from "../../../core/api/axiosClient";

export const authApi = {
  login: async (payload: any) => {
    const response = await axiosClient.post('/auth/login', payload);
    return response.data; // Returns AuthResponse containing token, userId, email, etc.
  },
  
  register: async (payload: any) => {
    const response = await axiosClient.post('/auth/register', payload);
    return response.data;
  }
};