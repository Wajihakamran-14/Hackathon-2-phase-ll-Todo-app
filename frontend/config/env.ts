// Environment configuration
export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  authCookieName: process.env.AUTH_COOKIE_NAME || 'auth_token',
  refreshTokenCookieName: process.env.REFRESH_TOKEN_COOKIE_NAME || 'refresh_token',
  jwtExpiryThreshold: parseInt(process.env.JWT_EXPIRY_THRESHOLD || '300', 10), // 5 minutes in seconds
};