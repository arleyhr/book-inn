import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { LoginDto, RegisterDto } from '../dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  async refreshToken(
    @Body() body: { userId: number; refreshToken: string },
  ) {
    if (!body.userId || !body.refreshToken) {
      throw new UnauthorizedException('Invalid refresh token request');
    }
    return this.authService.refreshToken(body.userId, body.refreshToken);
  }
}
