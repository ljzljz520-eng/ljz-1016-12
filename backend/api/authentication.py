"""
JWT Authentication - JWT认证模块
"""
import jwt
import logging
from datetime import datetime, timedelta
from django.conf import settings
from django.contrib.auth.models import User
from rest_framework import authentication, exceptions

logger = logging.getLogger(__name__)


def generate_token(user: User) -> str:
    """生成JWT Token"""
    payload = {
        'user_id': user.id,
        'username': user.username,
        'exp': datetime.utcnow() + timedelta(hours=settings.JWT_EXPIRATION_HOURS),
        'iat': datetime.utcnow(),
    }
    token = jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm='HS256')
    return token


def decode_token(token: str) -> dict:
    """解码JWT Token"""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        raise exceptions.AuthenticationFailed('Token已过期')
    except jwt.InvalidTokenError:
        raise exceptions.AuthenticationFailed('无效的Token')


class JWTAuthentication(authentication.BaseAuthentication):
    """JWT认证类"""
    
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            return None
        
        try:
            prefix, token = auth_header.split(' ')
            if prefix.lower() != 'bearer':
                return None
        except ValueError:
            return None
        
        try:
            payload = decode_token(token)
            user_id = payload.get('user_id')
            
            try:
                user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                raise exceptions.AuthenticationFailed('用户不存在')
            
            if not user.is_active:
                raise exceptions.AuthenticationFailed('用户已被禁用')
            
            return (user, token)
            
        except exceptions.AuthenticationFailed:
            raise
        except Exception as e:
            logger.error(f"JWT认证错误: {str(e)}")
            raise exceptions.AuthenticationFailed('认证失败')
    
    def authenticate_header(self, request):
        return 'Bearer'
