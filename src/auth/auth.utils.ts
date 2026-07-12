import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { CONFIGS } from 'src/configs';

@Injectable()
export class AuthUtilService {
  // Fixed hash compared against when no user is found, so a login attempt
  // for a non-existent account takes the same time as one for a real account.
  private readonly dummyHash = bcrypt.hashSync(
    'dummy-password-for-timing-safety',
    CONFIGS.BCRYPT_SALT_ROUNDS,
  );

  async hashPassword(password: string): Promise<string> {
    const hash = await bcrypt.hash(password, CONFIGS.BCRYPT_SALT_ROUNDS);
    return hash;
  }

  // Compare a plain password with a hashed password
  verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  // Runs a bcrypt compare against a fixed dummy hash to keep the "user not
  // found" path the same cost as the "wrong password" path.
  async verifyPasswordTimingSafeNoOp(password: string): Promise<void> {
    await bcrypt.compare(password, this.dummyHash);
  }

  // Generate access and refresh tokens
  generateJwtToken(
    payload: { type: 'access' | 'refresh' | 'invite' } & Record<
      string,
      string
    >,
    lifetime: number,
  ) {
    const token = jwt.sign(payload, CONFIGS.JWT_SECRET, {
      expiresIn: lifetime,
      algorithm: 'HS256',
    });
    return token;
  }

  // Verify access token
  verifyToken(token: string): any {
    return jwt.verify(token, CONFIGS.JWT_SECRET, { algorithms: ['HS256'] });
  }
}
