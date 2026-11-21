# 伴月轩智能中枢

本仓库是伴月轩智能中枢的开发备份与 AI Agent 交接入口。计划使用 **私有仓库** `Alston3825/banyuexuan-intelligent-hub`，描述包含中文名称。

接手顺序：先读 [HANDOFF.md](HANDOFF.md)，再读自动更新的 [HANDOFF-AUTO.md](HANDOFF-AUTO.md)、[备份与恢复说明](docs/BACKUP-RESTORE.md) 和 `progress/LATEST.json`。目录存在或定时器 active 不代表 GitHub 备份已成功。

- Git：代码、数据库结构、部署模板、交接、决策和进展；保留提交历史，不强制推送。
- 私有 GitHub Releases：限定正式群的数据、图片/视频及数据库快照，上传前使用 AES-256-GCM 加密。128 MiB 分片，每片 SHA-256。
- 不进入 Git/GitHub 明文：客户原始健康资料、数据库数据、日志、环境配置、SSH/API/数据库密钥。
- 恢复私钥由项目所有者单独保管，不上传服务器或 GitHub；没有它无法恢复加密快照。

私有仓库已创建且账号已重新授权。实际是否已上传，以 GitHub 远端提交和 Release 验证结果为准。Mac后续工作目录为 `~/Projects/banyuexuan-intelligent-hub`，规避后台访问Documents的系统限制。恢复密钥单独位于所有者Mac的 `~/Documents/Codex/伴月轩恢复密钥/`，务必另存离线介质。
