import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
// gelen istekteki tokenı kontrol eder
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // token gelen isteğin neresinden okunacak onu belirtir. burada header'dan bearer token olarak okunacağı belirtilmiş.
      ignoreExpiration: false, // token geçerlilik süresini dikkate alır
      secretOrKey: 'SECRET_KEY', // gelen tokeı kontrol ederken kullanılacak key
    });
  }

  // token doğru ise payload bilgilerini isteğin içine user olarak kaydeder. istenirse veritabanından da user entitysi çekilip kaydedilebilir.
  async validate(payload: any) {
    return { id: payload.sub, username: payload.username, role: payload.role };
  }
}
