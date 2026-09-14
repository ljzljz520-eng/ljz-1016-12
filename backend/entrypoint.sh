#!/bin/bash
set -e

# 设置Django环境变量
export DJANGO_SETTINGS_MODULE=ops_admin.settings

# 等待数据库就绪函数
wait_for_db() {
    echo "等待数据库连接..."
    for i in {1..30}; do
        python -c "
import pymysql
import os
try:
    conn = pymysql.connect(
        host=os.environ.get('DB_HOST', 'db'),
        port=int(os.environ.get('DB_PORT', 3306)),
        user=os.environ.get('DB_USER', 'ops_user'),
        password=os.environ.get('DB_PASSWORD', 'ops_pass'),
        database=os.environ.get('DB_NAME', 'ops_admin')
    )
    conn.close()
    print('数据库连接成功')
    exit(0)
except Exception as e:
    print(f'等待数据库... {e}')
    exit(1)
" && break
        echo "重试 $i/30..."
        sleep 2
    done
}

# 等待数据库
wait_for_db

# 生成迁移文件
echo "生成迁移文件..."
python manage.py makemigrations api --noinput || true

# 执行数据库迁移
echo "执行数据库迁移..."
python manage.py migrate --noinput

# 验证迁移是否成功
echo "验证数据库表..."
python manage.py shell -c "
from django.db import connection
with connection.cursor() as cursor:
    cursor.execute('SHOW TABLES')
    tables = cursor.fetchall()
    print('数据库表:', [t[0] for t in tables])
"

# 创建超级用户
echo "初始化管理员用户..."
python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    user = User.objects.create_superuser('admin', 'admin@ops.local', 'admin123')
    print('管理员用户创建成功')
else:
    user = User.objects.get(username='admin')
    user.set_password('admin123')
    user.save()
    print('管理员密码已重置')
"

# 初始化演示数据
echo "初始化演示数据..."
python manage.py shell -c "
from api.models import Server, Alert, Task, OperationLog
from django.contrib.auth import get_user_model
User = get_user_model()

# 创建服务器数据
if Server.objects.count() == 0:
    servers_data = [
        {'name': 'Web服务器-01', 'ip_address': '192.168.1.10', 'status': 'running', 'cpu_usage': 45.5, 'memory_usage': 62.3, 'disk_usage': 55.8, 'os_type': 'CentOS 7.9', 'location': '北京机房A区'},
        {'name': 'Web服务器-02', 'ip_address': '192.168.1.11', 'status': 'running', 'cpu_usage': 32.1, 'memory_usage': 48.7, 'disk_usage': 42.3, 'os_type': 'CentOS 7.9', 'location': '北京机房A区'},
        {'name': '数据库服务器-01', 'ip_address': '192.168.1.20', 'status': 'running', 'cpu_usage': 78.2, 'memory_usage': 85.6, 'disk_usage': 72.1, 'os_type': 'CentOS 8.0', 'location': '北京机房B区'},
        {'name': '数据库服务器-02', 'ip_address': '192.168.1.21', 'status': 'warning', 'cpu_usage': 65.8, 'memory_usage': 79.4, 'disk_usage': 68.9, 'os_type': 'CentOS 8.0', 'location': '北京机房B区'},
        {'name': '缓存服务器-01', 'ip_address': '192.168.1.30', 'status': 'running', 'cpu_usage': 28.4, 'memory_usage': 52.1, 'disk_usage': 35.6, 'os_type': 'Ubuntu 22.04', 'location': '上海机房A区'},
        {'name': '应用服务器-01', 'ip_address': '192.168.1.40', 'status': 'stopped', 'cpu_usage': 0.0, 'memory_usage': 0.0, 'disk_usage': 45.2, 'os_type': 'Ubuntu 20.04', 'location': '上海机房B区'},
        {'name': '负载均衡-01', 'ip_address': '192.168.1.50', 'status': 'running', 'cpu_usage': 15.3, 'memory_usage': 22.8, 'disk_usage': 28.4, 'os_type': 'CentOS 7.9', 'location': '北京机房A区'},
        {'name': '监控服务器-01', 'ip_address': '192.168.1.60', 'status': 'running', 'cpu_usage': 42.7, 'memory_usage': 56.3, 'disk_usage': 61.2, 'os_type': 'Ubuntu 22.04', 'location': '深圳机房A区'},
    ]
    for data in servers_data:
        Server.objects.create(**data)
    print('服务器数据初始化完成')

# 创建告警数据
if Alert.objects.count() == 0:
    server3 = Server.objects.filter(name='数据库服务器-01').first()
    server4 = Server.objects.filter(name='数据库服务器-02').first()
    server5 = Server.objects.filter(name='缓存服务器-01').first()
    server6 = Server.objects.filter(name='应用服务器-01').first()
    
    alerts_data = [
        {'title': 'CPU使用率过高', 'description': '数据库服务器-01 CPU使用率达到78.2%，超过预警阈值', 'level': 'warning', 'status': 'pending', 'server': server3},
        {'title': '内存使用率告警', 'description': '数据库服务器-01 内存使用率达到85.6%，建议扩容', 'level': 'danger', 'status': 'pending', 'server': server3},
        {'title': '服务器离线', 'description': '应用服务器-01 已停止运行，请检查', 'level': 'danger', 'status': 'pending', 'server': server6},
        {'title': '磁盘空间不足', 'description': '数据库服务器-02 磁盘使用率接近70%', 'level': 'warning', 'status': 'resolved', 'server': server4},
        {'title': '网络延迟过高', 'description': '缓存服务器-01 网络延迟超过100ms', 'level': 'info', 'status': 'resolved', 'server': server5},
    ]
    for data in alerts_data:
        Alert.objects.create(**data)
    print('告警数据初始化完成')

# 创建任务数据
if Task.objects.count() == 0:
    admin = User.objects.filter(username='admin').first()
    tasks_data = [
        {'name': '服务器扩容评估', 'description': '评估数据库服务器扩容方案', 'status': 'in_progress', 'priority': 'high', 'assigned_to': admin},
        {'name': '系统安全巡检', 'description': '本周系统安全漏洞扫描', 'status': 'pending', 'priority': 'normal', 'assigned_to': admin},
        {'name': '备份策略优化', 'description': '优化数据库备份策略，减少备份时间', 'status': 'completed', 'priority': 'normal', 'assigned_to': admin},
        {'name': '监控告警规则调整', 'description': '调整CPU和内存告警阈值', 'status': 'pending', 'priority': 'low', 'assigned_to': admin},
        {'name': 'SSL证书更新', 'description': '更新Web服务器SSL证书', 'status': 'in_progress', 'priority': 'high', 'assigned_to': admin},
    ]
    for data in tasks_data:
        Task.objects.create(**data)
    print('任务数据初始化完成')

print('所有演示数据初始化完成')
"

# 启动Django服务
echo "启动Django服务..."
exec gunicorn ops_admin.wsgi:application --bind 0.0.0.0:8000 --workers 2 --access-logfile - --error-logfile -
