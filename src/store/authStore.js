import { create } from "zustand";
import api, { setAccessToken } from "../api/client";
import { disconnectAllSockets } from "../api/socket";

const useAuthStore = create((set) => ({
  user: null,
  isLoading: true, // true until the initial refresh-on-load check finishes
  error: null,

  // Called once when the app mounts — tries to silently log the user back in
  // using the refresh cookie, so a page reload doesn't force a fresh login.
  async initAuth() {
    try {
      const { data } = await api.post("/auth/refresh");
      setAccessToken(data.token);
      const meRes = await api.get("/auth/me");
      set({ user: meRes.data.user, isLoading: false });
    } catch {
      setAccessToken(null);
      set({ user: null, isLoading: false });
    }
  },

  async login(email, password) {
    set({ error: null });
    try {
      const { data } = await api.post("/auth/login", { email, password });
      setAccessToken(data.token);
      set({ user: data.user });
      return true;
    } catch (err) {
      set({ error: err.response?.data?.message || "Login failed" });
      return false;
    }
  },

  async signup(name, email, password, role) {
    set({ error: null });
    try {
      const { data } = await api.post("/auth/signup", {
        name,
        email,
        password,
        role,
      });
      return { success: true, message: data.message };
    } catch (err) {
      const message = err.response?.data?.message || "Signup failed";
      set({ error: message });
      return { success: false, message };
    }
  },

  async logout() {
    try {
      await api.post("/auth/logout");
      
    } finally {
      disconnectAllSockets();
      setAccessToken(null);
      set({ user: null });
    }
  },
  updateUser(user) {
    set({ user });
  },
}));

export default useAuthStore;