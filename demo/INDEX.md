# TODO List

### 用户注册
#### 注册表单验证 100%
#### 注册失败，错误提示 90%
#### 注册成功，显示提示页面 100%
#### 注册成功，系统发送邮件 100%
#### 注册成功，用户收到邮件 100%
#### 邮件内容正确 100%
#### 用户通过邮件连接到达“注册验证”页面 100%
#### 邮件验证
##### 验证功能 80%
##### 已激活，重复激活 100% 
##### 验证页面显示 100%
##### 验证错误提示枚举 90%


### 用户登录
#### 登录表单验证 100%
#### 登录失败，错误提示 100%
#### 登录成功 100%

### 找回密码
#### 表单验证 100%
#### 提交成功，显示提示页面 90%
#### 提交成功，系统发送邮件 100%
#### 提交成功，用户收到邮件 100%
#### 邮件内容正确 100%
#### 用户通过邮件连接到达“密码重置”页面 100%
#### 重新设置密码
##### 表单验证 100%
##### 提交成功，显示提示页面 100%
##### 提交成功，密码修改成功 100%
##### 重重密码的token加密 0%

#### 邀请好友注册
##### 表单验证 100%
##### 发送邀请邮件给对方 100%
##### 对方通过邮件到达网站 100%
##### 对方完成注册并登录成功后，
###### 能自动将邀请者添加为好友 0%
##### 跟踪邀请邮件状态 0%

### 好友功能
#### 增加好友
##### 显示搜索用户表单 100%
##### 显示搜索用户结果 100%
##### 查找过滤己方 100%
##### 查找过滤跟己方邮件后缀相同的用户 100%
##### 查找过滤跟设定后缀相同的用户 0%
##### 查找过滤已经是好友的用户 0%
##### 对方收到邀请通知 100%
##### 对方收到邮件邀请通知 0%
##### 对方未同意前
###### 不会出现在对方好友列表中 100%
##### 对方在同意后
###### 出现在对方好友列表中 100%
###### 出现在己方好友列表中 100%
#### 删除好友
##### 删除好友需确认 100%
##### 取消 100%
##### 确认 
###### 对方从己方好友列表中消失 100%
###### 己方保留在对方好友列表中 100%
###### ?对方仍可以看到己方的动态 0%
#### ?关注好友 0%

### 通知提醒
#### 好友邀请通知
##### 同意 100%
#### 项目邀请通知
##### 同意 80% 
###### 项目名称？

### 单条动态显示
#### 正文区
##### 纯文本显示 100%
##### 图片显示 50%
##### 图文混合显示 50%
##### 视频显示 0%
##### 音频显示 0%
#### 点赞区 100%
#### 评论区 100%

### 同事圈
#### 动态列表
##### 按时间轴列表显示 100%
##### 获取时间轴动态优化 0%
##### 翻页 100%

### 我的(TA的)发表
#### 动态列表
##### 按时间轴列表显示 100%
##### 获取时间轴动态优化 0%
##### 翻页 100%

#### 发表动态
##### 支持文字 100%
###### 表单验证 100%
##### 支持图片 100%
##### 支持文字和多图混排 100%
###### 表单验证 100%
###### 显示排版及美化 80%
##### 支持语音 0%
##### 支持视频 0%
##### 即时通知
###### 发送通知 50%
###### 接收通知 0% 
##### 即时消息
###### 发送消息 0%
###### 接收消息 0% 
##### 多次发表 100%

#### 点赞
###### 功能正确 100%
###### 显示排版及美化 80%
###### 支持即时通知 0%
###### 支持即时消息 0%

#### 发表评论
###### 表单验证 100%
###### 多次发表 100%
###### 显示排版及美化 80%
###### 发表评论，同一时间只打开一个表单 100%
###### 支持即时通知 0%
###### 支持即时消息 0%

#### 发表私信
###### 表单验证 100%
###### 多次发表 100%
###### 显示排版及美化 80%
###### 支持即时通知 0%
###### 支持即时消息 0%

### 全局
#### 缺省route的处理(*path) 100%

### 安全性
#### 注册和登陆时，密码在浏览器中sha256 0%
#### 返回数据的裁剪

### 可维护性
#### 数据库慢查询
#### 应用异常检测