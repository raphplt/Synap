import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto, LoginDto } from '@memex/shared';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async hashPassword(password: string): Promise<string> {
    return await argon2.hash(password);
  }

  async verifyPassword(hash: string, plain: string): Promise<boolean> {
    return await argon2.verify(hash, plain);
  }

  async validateUser(loginDto: LoginDto): Promise<any> {
    // TODO: Fetch user from DB
    const user = { email: 'test@test.com', passwordHash: '...' }; 
    const isMatch = await this.verifyPassword(user.passwordHash, loginDto.password);
    if (user && isMatch) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.userId };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(registerDto: RegisterDto) {
    const hashedPassword = await this.hashPassword(registerDto.password);
    // TODO: Save user to DB
    return {
       ...registerDto,
       password: hashedPassword
    }
  }
}
