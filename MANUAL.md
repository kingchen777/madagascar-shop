# MadaShop 操作手册 & 部署说明书

> 版本：1.0 | 更新：2026-06-03
> 生产地址：https://madagascar-shop-kxk6.vercel.app
> 管理后台：https://madagascar-shop-kxk6.vercel.app/admin
> 数据库：https://supabase.com/dashboard/project/uanvkasbfrcssejpelrn

---

## 目录

1. [后台操作指南](#一后台操作指南)
2. [当前方案说明（Vercel + Supabase）](#二当前方案vercel--supabase)
3. [部署方案 A：宝塔面板 VPS](#三部署方案-a宝塔面板-vps)
4. [部署方案 B：纯命令行 VPS（无宝塔）](#四部署方案-b纯命令行-vps无宝塔)
5. [环境变量说明](#五环境变量说明)
6. [常见问题排查](#六常见问题排查)

---

## 一、后台操作指南

### 1.1 登录后台

访问：`https://madagascar-shop-kxk6.vercel.app/admin`

- 输入 `ADMIN_PASSWORD`（在 Vercel 环境变量中设置）
- 登录后 Cookie 有效期 7 天，关闭浏览器不会自动退出

---

### 1.2 仪表盘 `/admin`

首页显示：
- **最新订单**：最近 10 条订单，点击可进入详情
- **待确认付款**：客户已上传截图、等待人工核实的订单（黄色提醒）
- **商品数量**：已上架商品总数

---

### 1.3 商品管理 `/admin/products`

#### 新增商品

1. 点右上角 **+ Nouveau produit**
2. 填写以下字段：

| 字段 | 说明 | 必填 |
|------|------|------|
| 类型 | SELF（自营现货）/ AGENT（代购） | ✅ |
| 来源平台 | 淘宝/天猫/1688/拼多多/京东 | AGENT必填 |
| 商品链接 | 原始商品 URL | 否 |
| 分类 | 从已有分类选择 | 否 |
| 售价（MGA） | 马达加斯加法郎价格 | ✅ |
| CNY 成本价 | 人民币进价（仅内部可见） | 否 |
| 服务费率 % | 代购手续费百分比 | 否 |
| 重量 kg | 用于运费报价 | 否 |
| 库存 | 留空 = 不限库存 | 否 |
| 状态 | DRAFT（草稿/下架）/ ACTIVE（上架） | ✅ |

3. **上传图片**：点击图片区域，选择本地文件（JPG/PNG/WebP，最大 5MB），支持多张
4. **商品名称/描述**：
   - 可分别填写法语、英语、中文
   - 点 **Auto** 按钮自动用 AI 翻译（需要 ANTHROPIC_API_KEY 配置）
5. 点 **Enregistrer** 保存

#### 编辑/下架商品

- 在商品列表点右侧 **编辑** 图标
- 下架：将状态改为 `DRAFT` → 保存
- 删除：暂无一键删除按钮，可在 Supabase SQL Editor 执行：
  ```sql
  DELETE FROM "Product" WHERE id = 'xxx';
  ```

---

### 1.4 分类管理 `/admin/categories`

#### 新增分类

1. 填写分类名（法/英/中）
2. 选择父分类（留空 = 顶级分类，支持多级）
3. 排序权重（数字越小越靠前）
4. 点 **Créer** 保存

#### 注意

- 删除有商品的分类前，需先将商品移到其他分类
- 分类修改后前端实时生效

---

### 1.5 订单管理 `/admin/orders`

#### 订单状态说明

**自营订单（SELF）流程：**
```
DRAFT → DEPOSIT_PENDING → DEPOSIT_PAID → READY_FOR_PICKUP → COMPLETED
```

**代购订单（AGENT）流程：**
```
DRAFT → QUOTED → DEPOSIT_PENDING → DEPOSIT_PAID → PROCURING
→ PURCHASED → AT_CN_WAREHOUSE → BALANCE_PENDING → BALANCE_PAID
→ INTL_SHIPPING → ARRIVED_MG → READY_FOR_PICKUP → COMPLETED
```

#### 日常操作流程

1. 仪表盘看到「待确认付款」提醒
2. 点进订单详情 → 查看客户上传的付款截图
3. 确认收款后点 **Confirmer le paiement** 按钮
4. 根据进度逐步推进状态（每次只能推进到下一个合法状态）
5. 填写运单号（国际段物流号）
6. 最终标记 **COMPLETED**

#### 订单备注

在订单详情页可添加内部备注，客户不可见。

#### 导出订单 CSV

- 订单列表页点 **Exporter CSV** 按钮
- 下载包含：订单号、客户姓名、电话、邮件、类型、状态、总额、已付金额、余额、优惠码、日期
- 用 Excel 或 WPS 打开（UTF-8 编码）

---

### 1.6 促销码 `/admin/promos`

#### 新增促销码

| 字段 | 说明 |
|------|------|
| 代码 | 如 `WELCOME10`（大写字母+数字） |
| 类型 | PERCENT（百分比折扣）/ FIXED（固定金额减免） |
| 折扣值 | PERCENT 填 10 = 打九折；FIXED 填 5000 = 减 5000 Ar |
| 使用上限 | 留空 = 不限次数 |
| 有效期 | 过期后自动失效 |
| 启用/停用 | 可随时切换 |

---

### 1.7 网站设置 `/admin/settings`

| 设置项 | 说明 |
|--------|------|
| 汇率 CNY→MGA | 影响代购报价，建议每月更新 |
| WhatsApp 号码 | 页面右下角浮动按钮，格式：`261XXXXXXXXX` |
| 联系电话 | Footer 显示 |
| 联系邮箱 | Footer 显示 |

---

### 1.8 Supabase 直接查询数据

登录：https://supabase.com/dashboard/project/uanvkasbfrcssejpelrn/editor

**常用 SQL：**

```sql
-- 本月订单总额
SELECT SUM("totalAmount"::numeric) AS total
FROM "Order"
WHERE "createdAt" >= date_trunc('month', now());

-- 本月新增客户数
SELECT COUNT(*) FROM "User"
WHERE "createdAt" >= date_trunc('month', now());

-- 热销商品 TOP 10
SELECT t.name, COUNT(oi.id) AS sold_count
FROM "OrderItem" oi
JOIN "ProductTranslation" t ON t."productId" = oi."productId" AND t.locale = 'fr'
GROUP BY t.name
ORDER BY sold_count DESC
LIMIT 10;

-- 查询某客户所有订单
SELECT * FROM "Order"
WHERE "userId" = (SELECT id FROM "User" WHERE phone = '+261XXXXXXXXX');

-- 待处理订单列表
SELECT "orderNo", status, "totalAmount", "createdAt"
FROM "Order"
WHERE status NOT IN ('COMPLETED', 'CANCELLED')
ORDER BY "createdAt" DESC;
```

---

## 二、当前方案（Vercel + Supabase）

> 零运维，免费，适合现阶段。

### 架构图

```
用户浏览器
    ↓
Vercel（Next.js 托管）
    ↓
Supabase（PostgreSQL 数据库 + 文件存储）
```

### 日常维护

| 操作 | 方法 |
|------|------|
| 更新代码 | `git push` → Vercel 自动部署（约 2 分钟） |
| 查看部署日志 | https://vercel.com/dashboard |
| 查看数据库 | https://supabase.com/dashboard |
| 查看存储文件 | Supabase → Storage → product-images |
| 修改环境变量 | Vercel → Settings → Environment Variables → 重新部署 |

### 重新部署（手动触发）

```bash
# 在项目目录执行
git commit --allow-empty -m "chore: trigger redeploy"
git push
```

---

## 三、部署方案 A：宝塔面板 VPS

> 适合：有一定技术基础，希望自己管理服务器。

### 3.1 服务器要求

| 项目 | 最低配置 | 推荐配置 |
|------|---------|---------|
| CPU | 1 核 | 2 核 |
| 内存 | 2 GB | 4 GB |
| 硬盘 | 20 GB SSD | 40 GB SSD |
| 系统 | Ubuntu 22.04 | Ubuntu 22.04 |
| 位置 | 新加坡 / 香港 | 新加坡 |

推荐服务商：腾讯云轻量 / 阿里云 ECS / Vultr

### 3.2 安装宝塔面板

```bash
# SSH 登录服务器后执行
wget -O install.sh https://download.bt.cn/install/install-ubuntu_6.0.sh
sudo bash install.sh ed8484bec
```

安装完成后会显示：
```
宝塔面板地址: http://YOUR_IP:8888/xxxxx
用户名: admin
密码: xxxxxxxx
```

### 3.3 宝塔内安装软件

进入宝塔面板 → **软件商店**，安装：

- ✅ Nginx 1.24+
- ✅ Node.js 版本管理器（安装后选择 Node.js 20 LTS）
- ✅ PM2 管理器

### 3.4 上传代码

**方法一：Git 拉取（推荐）**

在宝塔 → 终端，执行：

```bash
cd /www/wwwroot
git clone https://github.com/kingchen777/madagascar-shop.git
cd madagascar-shop
```

**方法二：宝塔文件管理器**

上传打包好的代码压缩包，解压到 `/www/wwwroot/madagascar-shop/`

### 3.5 配置环境变量

```bash
cd /www/wwwroot/madagascar-shop
cp .env.example .env
```

用宝塔文件管理器编辑 `.env`，填入所有变量（见第五章）。

### 3.6 安装依赖并构建

```bash
cd /www/wwwroot/madagascar-shop
npm install
npm run build
```

### 3.7 配置 PM2 启动

```bash
pm2 start npm --name "madashop" -- start
pm2 save
pm2 startup
```

### 3.8 配置 Nginx

宝塔 → **网站** → **添加站点**：

- 域名：填你的域名（如 `shop.yourdomain.com`）
- 根目录：`/www/wwwroot/madagascar-shop`
- PHP版本：纯静态

站点创建后点 **设置** → **配置文件**，替换为：

```nginx
server {
    listen 80;
    server_name shop.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3.9 申请 SSL 证书（HTTPS）

宝塔 → 网站 → 站点设置 → **SSL** → **Let's Encrypt** → 申请免费证书

申请成功后开启 **强制 HTTPS**。

### 3.10 后续更新代码

```bash
cd /www/wwwroot/madagascar-shop
git pull
npm install
npm run build
pm2 restart madashop
```

---

## 四、部署方案 B：纯命令行 VPS（无宝塔）

> 适合：熟悉 Linux 命令行，不想装宝塔。

### 4.1 初始化服务器

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装基础工具
sudo apt install -y git curl wget vim ufw

# 配置防火墙
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

### 4.2 安装 Node.js 20

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v   # 应显示 v20.x.x
npm -v
```

### 4.3 安装 PM2

```bash
sudo npm install -g pm2
```

### 4.4 安装 Nginx

```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 4.5 拉取代码

```bash
cd /var/www
sudo git clone https://github.com/kingchen777/madagascar-shop.git
sudo chown -R $USER:$USER /var/www/madagascar-shop
cd madagascar-shop
```

### 4.6 配置环境变量

```bash
cp .env.example .env
vim .env   # 填入所有变量
```

### 4.7 构建项目

```bash
npm install
npm run build
```

### 4.8 PM2 启动

```bash
pm2 start npm --name "madashop" -- start
pm2 save
pm2 startup   # 按提示执行输出的命令，开机自启
```

### 4.9 配置 Nginx

```bash
sudo vim /etc/nginx/sites-available/madashop
```

粘贴以下内容：

```nginx
server {
    listen 80;
    server_name shop.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# 启用配置
sudo ln -s /etc/nginx/sites-available/madashop /etc/nginx/sites-enabled/
sudo nginx -t          # 检查配置语法
sudo systemctl reload nginx
```

### 4.10 申请 SSL 证书

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d shop.yourdomain.com
# 按提示操作，选择自动重定向 HTTP→HTTPS
```

证书 90 天自动续期，无需手动操作。

### 4.11 后续更新代码

```bash
cd /var/www/madagascar-shop
git pull
npm install
npm run build
pm2 restart madashop
```

---

## 五、环境变量说明

`.env` 文件完整说明：

```bash
# ── 数据库 ──────────────────────────────────────────────
# Supabase 连接字符串（Transaction mode，用于 Prisma）
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"

# Supabase Direct URL（用于 migrations）
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# ── Supabase 公开配置 ──────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJxxx..."         # 匿名密钥，可公开
SUPABASE_SERVICE_ROLE_KEY="eyJxxx..."              # 服务角色密钥，绝对保密

# ── 网站配置 ─────────────────────────────────────────────
NEXT_PUBLIC_APP_URL="https://your-domain.com"      # 生产域名
NEXT_PUBLIC_DEFAULT_LOCALE="fr"                    # 默认语言

# ── 后台密码 ─────────────────────────────────────────────
ADMIN_PASSWORD="your-strong-password"              # 后台登录密码，自定义

# ── AI 翻译（可选）──────────────────────────────────────
ANTHROPIC_API_KEY="sk-ant-xxx"                     # 商品自动翻译功能

# ── 邮件通知（可选）─────────────────────────────────────
RESEND_API_KEY="re_xxx"                            # 注册 resend.com 获取
RESEND_FROM_EMAIL="noreply@yourdomain.com"         # 发件人邮箱

# ── 支付（可选）──────────────────────────────────────────
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_xxx"  # Stripe 公钥
STRIPE_SECRET_KEY="sk_live_xxx"                    # Stripe 私钥
```

### 在 Vercel 上配置环境变量

1. 打开 https://vercel.com/dashboard
2. 选择项目 → **Settings** → **Environment Variables**
3. 逐一添加每个变量
4. 添加完成后点 **Redeploy** 重新部署

---

## 六、常见问题排查

### 网站打不开

```bash
# 检查 PM2 状态
pm2 status
pm2 logs madashop --lines 50

# 检查端口是否监听
ss -tlnp | grep 3000

# 检查 Nginx 状态
sudo systemctl status nginx
sudo nginx -t
```

### 数据库连接失败

- 检查 `DATABASE_URL` 是否正确
- Supabase 免费版有连接数限制（60 个），高并发时可能触发
- 检查 Supabase 项目是否暂停（免费版超过 1 周无活动会自动暂停）
  → 进 Supabase Dashboard 手动恢复

### 图片不显示

1. 检查 Supabase Storage → `product-images` 桶是否存在且为 **Public**
2. 检查图片 URL 域名是否在 `next.config.ts` 的 `remotePatterns` 白名单中

### 语言切换无效

- 清除浏览器缓存（Ctrl+Shift+Delete）
- 检查 `src/middleware.ts` 文件是否存在（不能是 `proxy.ts`）

### 后台登录失败

- 检查 `ADMIN_PASSWORD` 环境变量是否设置
- Vercel 上修改环境变量后需要重新部署才生效

### 更新代码后样式异常

```bash
# 清除 Next.js 构建缓存
rm -rf .next
npm run build
pm2 restart madashop
```

---

## 附：快速联系信息

| 服务 | 控制台 |
|------|--------|
| Vercel（部署） | https://vercel.com/dashboard |
| Supabase（数据库） | https://supabase.com/dashboard/project/uanvkasbfrcssejpelrn |
| GitHub（代码） | https://github.com/kingchen777/madagascar-shop |
| Resend（邮件） | https://resend.com/dashboard |
