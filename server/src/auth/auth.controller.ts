import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  Get,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('v1/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) { }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleLogin() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: any, @Res() res: Response) {
    const authResult = await this.authService.login(req.user);

    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') ||
      'http://localhost:8081';

    const payload = Buffer.from(
      JSON.stringify({
        access_token: authResult.access_token,
        user: authResult.user,
      }),
    ).toString('base64url');

    return res.redirect(
      `${frontendUrl}/oauth-callback?payload=${encodeURIComponent(payload)}`,
    );
  }

  @Get('github')
  @UseGuards(AuthGuard('github'))
  githubLogin() {}

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubCallback(@Req() req: any, @Res() res: Response) {
    const authResult = await this.authService.login(req.user);

    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') ||
      'http://localhost:8081';

    const payload = Buffer.from(
      JSON.stringify({
        access_token: authResult.access_token,
        user: authResult.user,
      }),
    ).toString('base64url');

    return res.redirect(
      `${frontendUrl}/oauth-callback?payload=${encodeURIComponent(payload)}`,
    );
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }
  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  @Post('reset-password')
  async resetPassword(@Body() body: any) {
    return this.authService.resetPassword(body.token, body.password);
  }
}
