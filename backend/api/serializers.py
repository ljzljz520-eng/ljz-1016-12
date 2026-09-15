"""
API Serializers - 序列化器
"""
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Server, Alert, Task, OperationLog


class UserSerializer(serializers.ModelSerializer):
    """用户序列化器"""
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_active', 'date_joined']
        read_only_fields = ['id', 'date_joined']


class LoginSerializer(serializers.Serializer):
    """登录序列化器"""
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(max_length=128, write_only=True)
    remember = serializers.BooleanField(required=False, default=False)


class ServerSerializer(serializers.ModelSerializer):
    """服务器序列化器"""
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Server
        fields = '__all__'


class AlertSerializer(serializers.ModelSerializer):
    """告警序列化器"""
    level_display = serializers.CharField(source='get_level_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    server_name = serializers.CharField(source='server.name', read_only=True, allow_null=True)
    
    class Meta:
        model = Alert
        fields = '__all__'


class TaskSerializer(serializers.ModelSerializer):
    """任务序列化器"""
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.username', read_only=True, allow_null=True)
    
    class Meta:
        model = Task
        fields = '__all__'


class OperationLogSerializer(serializers.ModelSerializer):
    """操作日志序列化器"""
    username = serializers.CharField(source='user.username', read_only=True, allow_null=True)
    
    class Meta:
        model = OperationLog
        fields = '__all__'


class DashboardStatsSerializer(serializers.Serializer):
    """仪表板统计序列化器"""
    total_servers = serializers.IntegerField()
    running_servers = serializers.IntegerField()
    stopped_servers = serializers.IntegerField()
    warning_servers = serializers.IntegerField()
    
    total_alerts = serializers.IntegerField()
    pending_alerts = serializers.IntegerField()
    danger_alerts = serializers.IntegerField()
    
    total_tasks = serializers.IntegerField()
    pending_tasks = serializers.IntegerField()
    in_progress_tasks = serializers.IntegerField()
    completed_tasks = serializers.IntegerField()
    
    avg_cpu_usage = serializers.FloatField()
    avg_memory_usage = serializers.FloatField()
    avg_disk_usage = serializers.FloatField()
