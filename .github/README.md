# CI/CD 配置

配置位置：GitHub 仓库 `Settings` -> `Secrets and variables` -> `Actions`。

## Variables

无。

## Secrets

必填：

| 名称           | 用途       |
| -------------- | ---------- |
| `SSH_HOST`     | 服务器地址 |
| `SSH_USERNAME` | SSH 用户名 |
| `SSH_KEY`      | SSH 私钥   |

可选：

| 名称                   | 用途                         |
| ---------------------- | ---------------------------- |
| `SSH_PORT`             | SSH 端口，默认 `22`          |
| `SSH_KNOWN_HOSTS`      | 服务器 known_hosts，推荐配置 |
| `NOTIFY_WEBHOOKS`      | 部署通知 webhook JSON 数组   |
| `REPORT_AUTHORIZATION` | 覆盖部署上报鉴权             |

## 部署

入口：`Actions` -> `Deploy` -> `Run workflow`。

| 环境   | 服务器路径                      | 预览地址                      |
| ------ | ------------------------------- | ----------------------------- |
| `prod` | `/var/www/orz2.online/html`     | `https://www.orz2.online`     |
| `uat`  | `/var/www/orz2.online/html/uat` | `https://www.orz2.online/uat` |

`bump` 默认选 `patch`；只部署不打 tag 时选 `none`。

当前部署 workflow 调用 `xshuliner/build-info` 仓库迁移后的
`release-deploy.yml`，构建命令会在 `pnpm run build:{env}` 内执行
`xbi generate`，生成：

```text
public/__xshuliner__/build-info.json
public/__xshuliner__/build-info.js
```

页面会加载 `build-info.js` 到 `window.__xshuliner__`。页脚展示当前版本和Git
commit hash，`/build-info` 页面展示详细构建、部署、Git 和 CI 信息。

建议服务器对 `/__xshuliner__/*` 配置
`Cache-Control: no-store`，避免部署后页面读取到旧版本构建信息。
