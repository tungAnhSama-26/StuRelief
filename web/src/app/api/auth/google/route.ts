import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { randomUUID } from 'crypto';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/crypto';
import { signToken } from '@/lib/jwt';
import { env } from '@/infrastructure/config/env';

/**
 * GET Handler: Phục vụ luồng đăng nhập Google OAuth 2.0 Thật.
 * 1. Khởi chạy luồng chuyển hướng sang Google: /api/auth/google
 * 2. Nhận Callback từ Google: /api/auth/google?code=xxx
 */
export async function GET(request: Request) {
  try {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const oauthError = searchParams.get('error');
    const cookieStore = await cookies();

    if (oauthError) {
      return NextResponse.redirect(`${origin}/login?error=google_oauth_denied`);
    }

    // --- BƯỚC 1: Khởi trị luồng OAuth nếu không có code ---
    if (!code) {
      const isPlaceholder = !env.GOOGLE_CLIENT_ID || env.GOOGLE_CLIENT_ID.startsWith('YOUR_');
      
      if (isPlaceholder) {
        // Nếu chưa cấu hình Client ID, chuyển về trang login cùng cờ báo lỗi
        return NextResponse.redirect(`${origin}/login?error=google_not_configured`);
      }

      const state = randomUUID();
      cookieStore.set('google_oauth_state', state, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 10 * 60,
        path: '/',
      });

      // Xây dựng URL đăng nhập thật của Google
      const redirectUri = `${origin}/api/auth/google`;
      const authParams = new URLSearchParams({
        client_id: env.GOOGLE_CLIENT_ID || '',
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'openid email profile',
        prompt: 'select_account',
        access_type: 'offline',
        include_granted_scopes: 'true',
        state,
      });
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${authParams.toString()}`;

      return NextResponse.redirect(googleAuthUrl);
    }

    // --- BƯỚC 2: Nhận Callback code và Đổi token thực từ Google ---
    const expectedState = cookieStore.get('google_oauth_state')?.value;
    const receivedState = searchParams.get('state');
    cookieStore.delete('google_oauth_state');

    if (!expectedState || expectedState !== receivedState) {
      return NextResponse.redirect(`${origin}/login?error=google_oauth_state_invalid`);
    }

    const redirectUri = `${origin}/api/auth/google`;
    
    // Gửi yêu cầu POST trao đổi Auth Code lấy ID Token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: env.GOOGLE_CLIENT_ID || '',
        client_secret: env.GOOGLE_CLIENT_SECRET || '',
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.id_token) {
      console.error('[Google Auth] Lỗi trao đổi mã Authorization Code:', tokenData);
      return NextResponse.redirect(`${origin}/login?error=google_oauth_failed`);
    }

    // Giải mã ID Token (JWT Payload chứa email, họ tên và ảnh đại diện)
    const base64Payload = tokenData.id_token.split('.')[1];
    const decodedPayload = JSON.parse(Buffer.from(base64Payload, 'base64').toString('utf8'));
    
    const email = decodedPayload.email;
    const fullName = decodedPayload.name || email.split('@')[0];
    const avatarUrl = decodedPayload.picture || null;

    if (!email) {
      return NextResponse.redirect(`${origin}/login?error=google_email_missing`);
    }

    // Ghi nhận đăng nhập và phân quyền Admin
    const userData = await registerOrLoginGoogleUser(email, fullName, avatarUrl);

    // Ký JWT Token Session chuẩn
    const token = signToken(userData, env.JWT_SECRET, 86400);

    // Ghi Cookie HttpOnly bảo mật cao
    const sessionCookies = await cookies();
    sessionCookies.set('token', token, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 86400,
      path: '/',
    });

    // Chuyển hướng về trang chủ thành công
    return NextResponse.redirect(`${origin}/?login_success=google`);
  } catch (error) {
    console.error('[Google Auth] Lỗi trong luồng GET OAuth 2.0:', error);
    return NextResponse.redirect(`${new URL(request.url).origin}/login?error=google_server_error`);
  }
}

/**
 * POST Handler: Dùng cho mô phỏng Test nhanh không cần Credentials.
 */
export async function POST(request: Request) {
  try {
    const { email, fullName, avatarUrl } = await request.json();

    if (!email) {
      return NextResponse.json(
        { message: 'Không nhận được địa chỉ email Google!' },
        { status: 400 }
      );
    }

    const userData = await registerOrLoginGoogleUser(email, fullName, avatarUrl);

    // Ký JWT Token Session chuẩn
    const token = signToken(userData, env.JWT_SECRET, 86400);

    // Ghi cookie session
    const cookieStore = await cookies();
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 86400,
      path: '/',
    });

    return NextResponse.json({
      message: 'Đăng nhập bằng tài khoản Google thành công!',
      user: userData,
    });
  } catch (error) {
    console.error('[Google Auth Simulation] Lỗi:', error);
    return NextResponse.json(
      { message: 'Lỗi máy chủ khi đăng nhập mô phỏng!' },
      { status: 500 }
    );
  }
}

/**
 * Hàm phụ trợ: Đăng ký mới hoặc Đăng nhập User Google, tự động phân quyền Admin
 */
async function registerOrLoginGoogleUser(email: string, fullName: string, avatarUrl?: string | null) {
  const isGoogleAdmin = email.toLowerCase() === env.GOOGLE_ADMIN_EMAIL.toLowerCase();

  let user = await prisma.user.findUnique({
    where: { email },
    include: { profile: true },
  });

  if (!user) {
    let university = await prisma.university.findFirst();
    if (!university) {
      university = await prisma.university.create({
        data: {
          id: 'DHQG_HCM',
          name: 'Đại học Quốc gia TP.HCM',
          emailDomains: ['vnuhcm.edu.vn'],
        },
      });
    }

    const randomPassword = `google_${Math.random().toString(36).substring(2)}`;
    const hashedPassword = hashPassword(randomPassword);

    user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: isGoogleAdmin ? 'ADMIN' : 'STUDENT',
        status: 'VERIFIED',
        profile: {
          create: {
            fullName: fullName,
            studentCode: `GG${Math.floor(100000 + Math.random() * 900000)}`,
            universityId: university.id,
            avatarUrl: avatarUrl || null,
          },
        },
      },
      include: {
        profile: true,
      },
    });
    console.log(`[Google Auth] Tạo tài khoản mới thành công: ${email} - Vai trò: ${user.role}`);
  } else {
    // Cập nhật vai trò Admin hoặc AvatarUrl nếu có thay đổi
    const updateData: any = {};
    if (isGoogleAdmin && user.role !== 'ADMIN') {
      updateData.role = 'ADMIN';
    }

    const profileUpdate: any = {};
    if (avatarUrl) {
      profileUpdate.avatarUrl = avatarUrl;
    }

    if (Object.keys(updateData).length > 0 || Object.keys(profileUpdate).length > 0) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          ...updateData,
          ...(Object.keys(profileUpdate).length > 0 ? {
            profile: {
              update: profileUpdate
            }
          } : {})
        },
        include: { profile: true },
      });
      console.log(`[Google Auth] Đã đồng bộ cập nhật thông tin tài khoản cho email: ${email}`);
    }
  }

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    fullName: user.profile?.fullName || user.email.split('@')[0],
    avatarUrl: user.profile?.avatarUrl || null,
  };
}
