# 静态站点部署

本仓库包含一个手动触发的生产部署 workflow，以及一个可复用的静态站点部署 workflow。

## 初始化服务器

仓库提供单文件初始化脚本
[`docs/setup-deploy-server.sh`](./setup-deploy-server.sh)。服务器不需要存在项目代码，也不需要额外上传配置文件。

脚本顶部集中定义默认配置。这些参数只影响服务器初始化，已有默认值；运行脚本时不需要额外填写：

```bash
DEPLOY_USER=deploy
DEPLOY_HOST=43.167.247.143
DEPLOY_PORT=22
DEPLOY_ROOT=/var/www/orz2.online/html
PROTECTED_ENTRIES=portal,gengjian1203
```

修改服务器 IP、端口、部署目录或保护条目时，只需修改脚本顶部对应值。也可以在运行脚本时通过同名环境变量临时覆盖。

脚本会自动：

1. 安装缺失的 `rsync` 和 `sudo`。
2. 创建或复用无密码的独立 `deploy` 账户。
3. 安装固定用途的 root helper 和最小化 `sudo` 规则。
4. 生成新的 GitHub Actions 专用 SSH 密钥，将公钥安装到服务器。
5. 输出需要保存到 GitHub 的全部配置值。
6. 在脚本退出时删除服务器上的临时私钥。

脚本可以在任意初始化阶段重复执行。重复运行会轮换 GitHub
Actions 专用密钥，因此需要使用最后一次输出更新 GitHub。

### 上传和运行

在管理员电脑的项目根目录执行：

```bash
scp docs/setup-deploy-server.sh root@43.167.247.143:/root/setup-deploy-server.sh
```

登录服务器后执行：

```bash
bash /root/setup-deploy-server.sh
```

如果 SSH 使用自定义端口，在 `scp` 命令增加 `-P 端口号`。

### 保存到 GitHub

打开仓库的 `Settings` → `Secrets and variables` →
`Actions`，按照脚本输出标题保存每组值：

当前生产 workflow 需要保存下列 **7 项必填值**。GitHub 侧没有选填项。

| 必填 | 类型     | 名称                       | 用途                             |
| ---- | -------- | -------------------------- | -------------------------------- |
| 是   | 仓库变量 | `DEPLOY_SSH_USER`          | SSH 登录账户。                   |
| 是   | 仓库变量 | `DEPLOY_SSH_HOST`          | 服务器 IP 或主机名。             |
| 是   | 仓库变量 | `DEPLOY_SSH_PORT`          | SSH 端口。                       |
| 是   | 仓库变量 | `DEPLOY_ROOT`              | 根站点部署目录。                 |
| 是   | 仓库变量 | `DEPLOY_PROTECTED_ENTRIES` | 逗号分隔的根目录保护条目。       |
| 是   | 仓库密钥 | `DEPLOY_SSH_PRIVATE_KEY`   | GitHub Actions 使用的 SSH 私钥。 |
| 是   | 仓库密钥 | `DEPLOY_SSH_KNOWN_HOSTS`   | 经过验证的服务器 `known_hosts`。 |

只复制每组标题之间的内容，不要复制标题本身。`DEPLOY_SSH_PRIVATE_KEY`
是敏感信息，不要发送给他人、粘贴到聊天窗口或提交到仓库。

不要通过关闭 `StrictHostKeyChecking` 来省略 `DEPLOY_SSH_KNOWN_HOSTS`。

## 根站点行为

生产 workflow 使用 `manifest-clean` 模式。每次发布时：

1. 将完整 `dist` 上传到部署账户的临时目录。
2. 读取本次 `dist` 的全部顶层文件和目录。
3. 删除上次部署清单中的旧产物，以及本次即将更新的同名条目。
4. 发布新的 `dist` 内容，并在最后替换 `index.html`。
5. 保存本次部署清单，供下一次发布清理旧产物。

因此，`dist` 新增 `manifest.json`、`images/`
等根级条目时，不需要修改 workflow 或服务器权限。`dist`
删除旧条目时，服务器也会在下一次发布中自动清理。

服务器根目录中不属于根站点构建产物的条目会被保留。脚本顶部的 `PROTECTED_ENTRIES`
还会受到 helper 的显式保护：即使 `dist`
意外出现同名目录，部署也会直接失败，不会覆盖它们。

如果 GitHub
Variables 与服务器 helper 配置不一致，部署会在上传前失败。重新运行初始化脚本并更新 GitHub
Variables 即可同步配置。

## 门户站点复用

其他仓库可以构建自己的静态站点、上传构件，并调用本仓库中的可复用 workflow。请将调用固定到经过审核的提交 SHA：

```yaml
name: Deploy portal

on:
  workflow_dispatch:

permissions:
  contents: read

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      # 构建项目并将产物作为 static-site-dist 构件上传。

  deploy:
    needs: build
    uses: xshuliner/orz2-project/.github/workflows/deploy-static-site.yml@REVIEWED_COMMIT_SHA
    with:
      artifact_name: static-site-dist
      ssh_host: ${{ vars.DEPLOY_SSH_HOST }}
      ssh_port: ${{ fromJSON(vars.DEPLOY_SSH_PORT) }}
      ssh_user: ${{ vars.DEPLOY_SSH_USER }}
      allowed_root: ${{ vars.DEPLOY_ROOT }}
      target_dir: ${{ format('{0}/portal', vars.DEPLOY_ROOT) }}
      sync_mode: overlay
      managed_entries: '.'
    secrets:
      ssh_private_key: ${{ secrets.DEPLOY_SSH_PRIVATE_KEY }}
      ssh_known_hosts: ${{ secrets.DEPLOY_SSH_KNOWN_HOSTS }}
```

`overlay` 模式会用新构件中的文件覆盖已有文件，但不会删除 `portal`
目录中的历史文件。首次启用门户站点部署前，需要单独授予部署账户对 `portal`
目录的写权限。

当可复用 workflow 迁移到专用仓库时，请替换 `uses`
中的仓库路径，并固定到该仓库中经过审核的提交 SHA。
