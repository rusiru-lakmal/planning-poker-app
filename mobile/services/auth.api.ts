import api, { saveToken, removeToken } from "./api";
import { LoginDto, SignupDto, AuthResponse, User } from "@/types/api";

/**
 * Transform backend user response (_id) to frontend format (id)
 */
const transformUser = (backendUser: any): User => {
  return {
    id: backendUser._id || backendUser.id,
    email: backendUser.email,
    name: backendUser.name,
  };
};

/**
 * Authentication API service
 */
class AuthAPI {
  /**
   * Login user
   */
  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const response = await api.post<{ access_token: string; user: any }>(
      "/auth/login",
      loginDto
    );

    // Save token to storage
    await saveToken(response.data.access_token);

    return {
      accessToken: response.data.access_token,
      user: transformUser(response.data.user),
    };
    return {
      accessToken: response.data.access_token,
      user: transformUser(response.data.user),
    };
  }

  /**
   * Login with Google token
   */
  async googleLogin(token: string): Promise<AuthResponse> {
    const response = await api.post<{ access_token: string; user: any }>(
      "/auth/google",
      { token }
    );

    // Save token to storage
    await saveToken(response.data.access_token);

    return {
      accessToken: response.data.access_token,
      user: transformUser(response.data.user),
    };
  }

  /**
   * Signup new user
   */
  async signup(signupDto: SignupDto): Promise<AuthResponse> {
    const response = await api.post<{ access_token: string; user: any }>(
      "/auth/signup",
      signupDto
    );

    // Don't save token - user must login manually after signup

    return {
      accessToken: response.data.access_token,
      user: transformUser(response.data.user),
    };
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    const response = await api.get<any>("/auth/me");
    return transformUser(response.data);
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    await removeToken();
  }
}

export default new AuthAPI();
