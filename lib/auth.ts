import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'your-secret-key';

export interface JWTPayload {
  userId: string;
  email: string;
}

/**
 * 从请求中验证JWT Token并返回用户信息
 */
export async function verifyAuth(request: NextRequest): Promise<JWTPayload | null> {
  try {
    // 从Authorization header获取token
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7); // 移除 "Bearer " 前缀

    // 验证token
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    
    return decoded;
  } catch (error) {
    console.error('Token验证失败:', error);
    return null;
  }
}

/**
 * 要求用户必须登录的中间件
 */
export async function requireAuth(request: NextRequest): Promise<JWTPayload> {
  const user = await verifyAuth(request);
  
  if (!user) {
    throw new Error('未登录或登录已过期');
  }
  
  return user;
}
