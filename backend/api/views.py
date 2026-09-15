"""
API Views - 视图层
"""
import logging
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.db.models import Avg
from django.middleware.csrf import get_token
from django.views.decorators.csrf import csrf_protect
from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import Server, Alert, Task, OperationLog
from .serializers import (
    UserSerializer, LoginSerializer, ServerSerializer,
    AlertSerializer, TaskSerializer, OperationLogSerializer,
    DashboardStatsSerializer
)

logger = logging.getLogger(__name__)


def api_response(success: bool, data=None, message: str = '', code: int = 200):
    """统一API响应格式"""
    return Response({
        'success': success,
        'code': code,
        'message': message,
        'data': data,
    }, status=code if code < 400 else code)


@api_view(['GET'])
@permission_classes([AllowAny])
def csrf_token(request):
    """下发 CSRF Token（同时写入 csrftoken Cookie）。

    前端在登录前先请求该接口，之后所有 POST/PUT/PATCH/DELETE
    请求都需要通过 X-CSRFToken 请求头回传该 Token。
    """
    return api_response(True, data={'csrfToken': get_token(request)})


@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_protect
def login_view(request):
    """用户登录：校验账号密码，成功后写入 Django Session。"""
    serializer = LoginSerializer(data=request.data)

    if not serializer.is_valid():
        return api_response(False, message='请输入用户名和密码', code=400)

    username = serializer.validated_data['username']
    password = serializer.validated_data['password']

    user = authenticate(username=username, password=password)

    if user is None:
        return api_response(False, message='用户名或密码错误', code=401)

    if not user.is_active:
        return api_response(False, message='用户已被禁用', code=403)

    # 写入服务端 Session，响应中通过 Set-Cookie 下发 sessionid
    # login() 内部会轮换 session key，避免会话固定攻击
    auth_login(request, user)

    # “记住我”使用浏览器级会话 Cookie；否则关闭浏览器后过期
    if not serializer.validated_data.get('remember', False):
        request.session.set_expiry(0)
    request.session.save()

    # 记录登录日志
    OperationLog.objects.create(
        action='用户登录',
        description=f'用户 {username} 登录系统',
        user=user,
        ip_address=get_client_ip(request)
    )

    logger.info(f"用户 {username} 登录成功")

    return api_response(True, data={
        'user': UserSerializer(user).data
    }, message='登录成功')


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_info(request):
    """获取当前登录用户信息（基于 Session 判定登录态）"""
    return api_response(True, data=UserSerializer(request.user).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """用户登出：清空服务端 Session 并使 sessionid Cookie 失效。"""
    username = request.user.username

    # 记录登出日志（flush 之后 request.user 将变为匿名用户，需先记录）
    OperationLog.objects.create(
        action='用户登出',
        description=f'用户 {username} 退出系统',
        user=request.user,
        ip_address=get_client_ip(request)
    )

    # 清空服务端会话数据、轮换 session key，
    # SessionMiddleware 会在响应中使 sessionid Cookie 失效
    auth_logout(request)

    logger.info(f"用户 {username} 退出系统")
    return api_response(True, message='登出成功')


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """获取仪表板统计数据"""
    # 服务器统计
    total_servers = Server.objects.count()
    running_servers = Server.objects.filter(status='running').count()
    stopped_servers = Server.objects.filter(status='stopped').count()
    warning_servers = Server.objects.filter(status='warning').count()
    
    # 告警统计
    total_alerts = Alert.objects.count()
    pending_alerts = Alert.objects.filter(status='pending').count()
    danger_alerts = Alert.objects.filter(level='danger', status='pending').count()
    
    # 任务统计
    total_tasks = Task.objects.count()
    pending_tasks = Task.objects.filter(status='pending').count()
    in_progress_tasks = Task.objects.filter(status='in_progress').count()
    completed_tasks = Task.objects.filter(status='completed').count()
    
    # 资源使用率统计
    running_server_stats = Server.objects.filter(status='running').aggregate(
        avg_cpu=Avg('cpu_usage'),
        avg_memory=Avg('memory_usage'),
        avg_disk=Avg('disk_usage')
    )
    
    stats = {
        'total_servers': total_servers,
        'running_servers': running_servers,
        'stopped_servers': stopped_servers,
        'warning_servers': warning_servers,
        'total_alerts': total_alerts,
        'pending_alerts': pending_alerts,
        'danger_alerts': danger_alerts,
        'total_tasks': total_tasks,
        'pending_tasks': pending_tasks,
        'in_progress_tasks': in_progress_tasks,
        'completed_tasks': completed_tasks,
        'avg_cpu_usage': round(running_server_stats['avg_cpu'] or 0, 2),
        'avg_memory_usage': round(running_server_stats['avg_memory'] or 0, 2),
        'avg_disk_usage': round(running_server_stats['avg_disk'] or 0, 2),
    }
    
    return api_response(True, data=stats)


class ServerViewSet(viewsets.ModelViewSet):
    """服务器视图集"""
    queryset = Server.objects.all()
    serializer_class = ServerSerializer
    permission_classes = [IsAuthenticated]
    
    def list(self, request):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return api_response(True, data=serializer.data)
    
    def retrieve(self, request, pk=None):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return api_response(True, data=serializer.data)


class AlertViewSet(viewsets.ModelViewSet):
    """告警视图集"""
    queryset = Alert.objects.all()
    serializer_class = AlertSerializer
    permission_classes = [IsAuthenticated]
    
    def list(self, request):
        queryset = self.get_queryset()
        status_filter = request.query_params.get('status')
        level_filter = request.query_params.get('level')
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if level_filter:
            queryset = queryset.filter(level=level_filter)
        
        serializer = self.get_serializer(queryset, many=True)
        return api_response(True, data=serializer.data)


class TaskViewSet(viewsets.ModelViewSet):
    """任务视图集"""
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
    
    def list(self, request):
        queryset = self.get_queryset()
        status_filter = request.query_params.get('status')
        priority_filter = request.query_params.get('priority')
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if priority_filter:
            queryset = queryset.filter(priority=priority_filter)
        
        serializer = self.get_serializer(queryset, many=True)
        return api_response(True, data=serializer.data)


class OperationLogViewSet(viewsets.ReadOnlyModelViewSet):
    """操作日志视图集"""
    queryset = OperationLog.objects.all()
    serializer_class = OperationLogSerializer
    permission_classes = [IsAuthenticated]
    
    def list(self, request):
        queryset = self.get_queryset()[:50]  # 最近50条
        serializer = self.get_serializer(queryset, many=True)
        return api_response(True, data=serializer.data)


def get_client_ip(request):
    """获取客户端IP"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip
