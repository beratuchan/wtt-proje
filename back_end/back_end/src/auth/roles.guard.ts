import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
// Bu guard gelen isteğin controllera ulaşıp ulaşmayacağına karar vermek için kullanılır. rolleri kontrol eder uygunsa endpoint çalışır.
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Role decorator'ı ile eklenen metadatalar reflector sayesinde okunur
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(), // endpoint ve fonksiyon düzeyinde metadata okur
      context.getClass(), // controller ve class seviyesinde metadata okur
    ]);

    if (!requiredRoles) {
      // roles olarak eklenmiş metadata yok ise
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; // JwtStrategy ile isteğin içine eklenmiş user bilgisi okunur

    if (!user || !user.role) {
      return false;
    }

    return requiredRoles.includes(user.role); // kullanıcının rolü istenen rollerin içinde var mı kontrolü yapılır
  }
}
