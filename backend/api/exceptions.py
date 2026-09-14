"""
Custom Exception Handler - 自定义异常处理
"""
import logging
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """自定义异常处理器"""
    response = exception_handler(exc, context)
    
    if response is not None:
        # 标准化错误响应格式
        custom_response_data = {
            'success': False,
            'code': response.status_code,
            'message': get_error_message(exc, response),
            'data': None,
        }
        response.data = custom_response_data
    else:
        # 处理未捕获的异常
        logger.error(f"未捕获的异常: {str(exc)}", exc_info=True)
        response = Response({
            'success': False,
            'code': status.HTTP_500_INTERNAL_SERVER_ERROR,
            'message': '服务器内部错误',
            'data': None,
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    return response


def get_error_message(exc, response):
    """获取错误消息"""
    if hasattr(exc, 'detail'):
        if isinstance(exc.detail, dict):
            # 处理字段验证错误
            messages = []
            for field, errors in exc.detail.items():
                if isinstance(errors, list):
                    messages.extend([str(e) for e in errors])
                else:
                    messages.append(str(errors))
            return '; '.join(messages) if messages else '请求参数错误'
        elif isinstance(exc.detail, list):
            return '; '.join([str(e) for e in exc.detail])
        else:
            return str(exc.detail)
    
    # 默认错误消息
    status_messages = {
        400: '请求参数错误',
        401: '未授权访问',
        403: '禁止访问',
        404: '资源不存在',
        405: '请求方法不允许',
        500: '服务器内部错误',
    }
    return status_messages.get(response.status_code, '未知错误')
