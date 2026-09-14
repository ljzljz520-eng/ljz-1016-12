"""
OPS Admin Models - 运维后台数据模型
"""
from django.db import models
from django.contrib.auth.models import User


class Server(models.Model):
    """服务器模型"""
    STATUS_CHOICES = [
        ('running', '运行中'),
        ('stopped', '已停止'),
        ('warning', '警告'),
        ('error', '错误'),
    ]
    
    name = models.CharField('服务器名称', max_length=100)
    ip_address = models.CharField('IP地址', max_length=45)
    status = models.CharField('状态', max_length=20, choices=STATUS_CHOICES, default='running')
    cpu_usage = models.DecimalField('CPU使用率', max_digits=5, decimal_places=2, default=0)
    memory_usage = models.DecimalField('内存使用率', max_digits=5, decimal_places=2, default=0)
    disk_usage = models.DecimalField('磁盘使用率', max_digits=5, decimal_places=2, default=0)
    os_type = models.CharField('操作系统', max_length=50, default='Linux')
    location = models.CharField('所在位置', max_length=100, blank=True)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    updated_at = models.DateTimeField('更新时间', auto_now=True)

    class Meta:
        db_table = 'ops_server'
        verbose_name = '服务器'
        verbose_name_plural = '服务器'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.ip_address})"


class Alert(models.Model):
    """告警模型"""
    LEVEL_CHOICES = [
        ('info', '信息'),
        ('warning', '警告'),
        ('danger', '危险'),
    ]
    
    STATUS_CHOICES = [
        ('pending', '待处理'),
        ('processing', '处理中'),
        ('resolved', '已解决'),
    ]
    
    title = models.CharField('告警标题', max_length=200)
    description = models.TextField('告警描述', blank=True)
    level = models.CharField('告警级别', max_length=20, choices=LEVEL_CHOICES, default='info')
    status = models.CharField('状态', max_length=20, choices=STATUS_CHOICES, default='pending')
    server = models.ForeignKey(
        Server, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='alerts',
        verbose_name='关联服务器'
    )
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    resolved_at = models.DateTimeField('解决时间', null=True, blank=True)

    class Meta:
        db_table = 'ops_alert'
        verbose_name = '告警'
        verbose_name_plural = '告警'
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class Task(models.Model):
    """任务模型"""
    STATUS_CHOICES = [
        ('pending', '待处理'),
        ('in_progress', '进行中'),
        ('completed', '已完成'),
        ('cancelled', '已取消'),
    ]
    
    PRIORITY_CHOICES = [
        ('low', '低'),
        ('normal', '普通'),
        ('high', '高'),
        ('urgent', '紧急'),
    ]
    
    name = models.CharField('任务名称', max_length=200)
    description = models.TextField('任务描述', blank=True)
    status = models.CharField('状态', max_length=20, choices=STATUS_CHOICES, default='pending')
    priority = models.CharField('优先级', max_length=20, choices=PRIORITY_CHOICES, default='normal')
    assigned_to = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='tasks',
        verbose_name='负责人'
    )
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    completed_at = models.DateTimeField('完成时间', null=True, blank=True)

    class Meta:
        db_table = 'ops_task'
        verbose_name = '任务'
        verbose_name_plural = '任务'
        ordering = ['-created_at']

    def __str__(self):
        return self.name


class OperationLog(models.Model):
    """操作日志模型"""
    action = models.CharField('操作', max_length=100)
    description = models.TextField('描述', blank=True)
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='operation_logs',
        verbose_name='操作人'
    )
    ip_address = models.CharField('IP地址', max_length=45, blank=True)
    created_at = models.DateTimeField('操作时间', auto_now_add=True)

    class Meta:
        db_table = 'ops_log'
        verbose_name = '操作日志'
        verbose_name_plural = '操作日志'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.action} - {self.created_at}"
