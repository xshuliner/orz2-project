# GitHub Actions

入口：`Actions` -> `Deploy` -> `Run workflow`。

参数统一为：

| 参数 | 默认 | 说明 |
| --- | --- | --- |
| `env` | `prod` | 部署环境：`prod`、`uat`。 |
| `bump` | `patch` | 版本递增：`patch`、`minor`、`major`；选 `none` 时复用最新 tag。 |

部署到腾讯云服务器：

| 环境 | 服务器路径 | 预览地址 |
| --- | --- | --- |
| `prod` | `/var/www/orz2.online/html` | `https://www.orz2.online` |
| `uat` | `/var/www/orz2.online/html/uat` | `https://www.orz2.online/uat` |

必填 Secrets：`SSH_HOST`、`SSH_USERNAME`、`SSH_KEY`。

可选 Secrets：`SSH_PORT`、`SSH_KNOWN_HOSTS`、`NOTIFY_WEBHOOKS`、`REPORT_AUTHORIZATION`。

本项目调用 `xshuliner/build-info/.github/workflows/release-deploy.yml@master`，业务侧只维护构建命令、部署路径和预览地址。
