import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    // Check if email already exists
    const existingGraduate = await this.prisma.graduate.findUnique({
      where: { email: dto.email },
    });

    if (existingGraduate) {
      throw new ConflictException('Email already registered');
    }

    // Check if event exists
    const event = await this.prisma.event.findUnique({
      where: { id: dto.event_id },
    });

    if (!event) {
      throw new ConflictException('Event not found');
    }

    // Hash password
    const password_hash = await bcrypt.hash(dto.password, 10);

    // Create graduate
    const graduate = await this.prisma.graduate.create({
      data: {
        event_id: dto.event_id,
        full_name: dto.full_name,
        email: dto.email,
        phone: dto.phone,
        career: dto.career,
        generation: dto.generation,
        group: dto.group,
        password_hash,
        status: 'pending',
      },
      select: {
        id: true,
        event_id: true,
        full_name: true,
        email: true,
        phone: true,
        career: true,
        generation: true,
        group: true,
        status: true,
      },
    });

    // Generate JWT token
    const token = this.generateToken(graduate.id, graduate.email);

    return {
      graduate,
      token,
    };
  }

  async login(dto: LoginDto) {
    // Find graduate by email
    const graduate = await this.prisma.graduate.findUnique({
      where: { email: dto.email },
    });

    if (!graduate) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      dto.password,
      graduate.password_hash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const token = this.generateToken(graduate.id, graduate.email);

    return {
      graduate: {
        id: graduate.id,
        full_name: graduate.full_name,
        email: graduate.email,
        status: graduate.status,
      },
      token,
    };
  }

  private generateToken(id: string, email: string): string {
    const payload = { sub: id, email };
    return this.jwtService.sign(payload);
  }

  async validateUser(userId: string) {
    return this.prisma.graduate.findUnique({
      where: { id: userId },
    });
  }
}
