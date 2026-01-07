import { IsInt, IsNotEmpty, IsString, Max, Min, IsOptional, IsEmail, MinLength, Matches} from 'class-validator';
import { Match } from 'src/decorators/match.decorator';

export class RegisterUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @Matches(/(?=.*[a-z])/, { 
    message: 'Password must contain at least one lowercase letter' 
  })
  @Matches(/(?=.*[A-Z])/, { 
    message: 'Password must contain at least one uppercase letter' 
  })
  @Matches(/(?=.*\d)/, { 
    message: 'Password must contain at least one number' 
  })
  @Matches(/(?=.*[@$!%*?&])/, { 
    message: 'Password must contain at least one special character' 
  })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'Confirm password is required' })
  @Match('password', { message: 'Password and confirm password do not match' })
  confirmPassword: string;

  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsOptional()
  @IsString()
  photo?: string;
}