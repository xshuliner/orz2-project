# CI/CD 配置

配置位置：GitHub 仓库 `Settings` -> `Secrets and variables` -> `Actions`。

## Variables

无。

## Secrets

必填：

| 名称              | 用途               |
| ----------------- | ------------------ |
| `SSH_HOST`        | 服务器地址         |
| `SSH_USERNAME`    | SSH 用户名         |
| `SSH_KEY`         | SSH 私钥           |
| `SSH_KNOWN_HOSTS` | 服务器 known_hosts |

可选：

| 名称                   | 用途                       |
| ---------------------- | -------------------------- |
| `SSH_PORT`             | SSH 端口，默认 `22`        |
| `NOTIFY_WEBHOOKS`      | 部署通知 webhook JSON 数组 |
| `REPORT_AUTHORIZATION` | 覆盖部署上报鉴权           |

## 部署

入口：`Actions` -> `Deploy` -> `Run workflow`。

| 环境   | 服务器路径                      | 预览地址                      |
| ------ | ------------------------------- | ----------------------------- |
| `prod` | `/var/www/orz2.online/html`     | `https://www.orz2.online`     |
| `uat`  | `/var/www/orz2.online/html/uat` | `https://www.orz2.online/uat` |

`bump` 默认选 `patch`；只部署不打 tag 时选 `none`。
