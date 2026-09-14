"""
Django Admin Configuration - 后台管理配置
"""
from django.contrib import admin
from .models import Server, Alert, Task, OperationLog


@admin.register(Server)
class ServerAdmin(admin.ModelAdmin):
    list_display = ['name', 'ip_address', 'status', 'cpu_usage', 'memory_usage', 'disk_usage', 'location']
    list_filter = ['status', 'os_type', 'location']
    search_fields = ['name', 'ip_address']


@admin.register(Alert)
class AlertAdmin(admin.ModelAdmin):
    list_display = ['title', 'level', 'status', 'server', 'created_at']
    list_filter = ['level', 'status']
    search_fields = ['title', 'description']


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ['name', 'status', 'priority', 'assigned_to', 'created_at']
    list_filter = ['status', 'priority']
    search_fields = ['name', 'description']


@admin.register(OperationLog)
class OperationLogAdmin(admin.ModelAdmin):
    list_display = ['action', 'user', 'ip_address', 'created_at']
    list_filter = ['action']
    search_fields = ['action', 'description']
    readonly_fields = ['action', 'description', 'user', 'ip_address', 'created_at']
