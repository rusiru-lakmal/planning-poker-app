// Network Configuration
// Replace this IP with your computer's local IP address
// You can find it by running 'ipconfig' in a terminal
export const API_URL = "http://172.20.10.2:3000";

export const Config = {
  API_BASE_URL: __DEV__ ? API_URL : "https://api.yourproduction.com",
  SOCKET_URL: __DEV__ ? API_URL : "https://api.yourproduction.com",
};
