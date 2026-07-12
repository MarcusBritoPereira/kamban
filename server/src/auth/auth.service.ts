import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userData } = createUserDto;

    const user = await this.prisma.user.create({
      data: {
        ...userData,
        role: 'gestor', // New self-service accounts can create and manage spaces
        password_hash: hashedPassword,
      },
    });

    const { password_hash: _, ...result } = user;
    return result;
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return null;

    if (!user.password_hash) return null;

    const isMatch = await bcrypt.compare(pass, user.password_hash);

    if (isMatch) {
      const { password_hash: _, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar_url: user.avatar_url,
      },
    };
  }
  async validateOAuthUser(profile: {
    provider: 'google' | 'github';
    providerId: string;
    email: string;
    name: string;
    avatarUrl?: string | null;
  }) {
    const normalizedEmail = profile.email.trim().toLowerCase();

    const providerUser = await this.prisma.user.findFirst({
      where: {
        auth_provider: profile.provider,
        provider_id: profile.providerId,
      },
    });

    if (providerUser) {
      return providerUser;
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return this.prisma.user.update({
        where: { id: existingUser.id },
        data: {
          auth_provider: profile.provider,
          provider_id: profile.providerId,
          avatar_url: existingUser.avatar_url || profile.avatarUrl || null,
        },
      });
    }

    return this.prisma.user.create({
      data: {
        name: profile.name,
        email: normalizedEmail,
        password_hash: null,
        auth_provider: profile.provider,
        provider_id: profile.providerId,
        avatar_url: profile.avatarUrl || null,
        role: 'gestor',
      },
    });
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Don't leak user existence
      return { message: 'If email exists, recovery instructions sent.' };
    }

    const { randomBytes } = await import('crypto');
    const token = randomBytes(32).toString('hex');
    const expires = new Date();
    expires.setHours(expires.getHours() + 1); // 1 hour

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        reset_token: token,
        reset_token_expires: expires,
      },
    });

    // Send Email
    await this.sendRecoveryEmail(email, token);

    return { message: 'If email exists, recovery instructions sent.' };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        reset_token: token,
        reset_token_expires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password_hash: hashedPassword,
        reset_token: null,
        reset_token_expires: null,
      },
    });

    return { message: 'Password reset successful' };
  }

  private async sendRecoveryEmail(email: string, token: string) {
    const nodemailer = await import('nodemailer');

    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT ?? 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from =
      process.env.SMTP_FROM ?? '"Project Up" <no-reply@projectup.com>';
    const frontendUrl = process.env.FRONTEND_URL;

    if (!host || !user || !pass || !frontendUrl) {
      throw new Error(
        'SMTP_HOST, SMTP_USER, SMTP_PASS and FRONTEND_URL must be configured for password recovery',
      );
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    const resetUrl = `${frontendUrl.replace(/\/$/, '')}/reset-password?token=${encodeURIComponent(token)}`;

    await transporter.sendMail({
      from,
      to: email,
      subject: 'Password Recovery',
      text: `You requested a password reset. Open this link to reset your password: ${resetUrl}`,
      html: `<p>You requested a password reset.</p><p><a href="${resetUrl}">Reset your password</a></p>`,
    });
  }
}
