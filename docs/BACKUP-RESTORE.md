# 备份计划与恢复

## 计划

服务器 systemd timer 明确 Asia/Shanghai，每日03:00、09:00、15:00、21:00。Mac休眠不影响服务器备份；服务器重启 Persistent=true 补跑一次并记录实际时间，不伪造遗漏时点的历史快照。

代码与交接保留 Git 提交历史；数据库与限定群附件按单一可重复读快照导出，再加密分片上传私有 Release。该群以外原始资料不在本任务授权范围，禁止全库数据转储。数据库结构可以导出，结构存在不等于业务数据已全部备份。

GitHub不可用时加密快照留在服务器 outbox，下次认证恢复逐份补传。互斥锁避免重叠，原子文件避免半成品，5GiB磁盘余量保护；失败不会标成功。暂不自动删除历史备份；建议积累后按7天四次、30天每日、12个月每月分级保留，删除需所有者确认。恢复演练完成前不删除任何快照。

## 资料范围与明确缺口

server/包含现有采集、回调、知识库、审核应用的可扫描代码/部署模板；私钥、环境文件、config.json、运行数据不进Git。源配置缺失时需所有者凭证库补齐，不冒充完整全量灾备。

加密快照包含该正式群原始消息、关联附件、案例子题、答复、证据、审核、分类、版本、使用权限及相关资料；保留有效附件、待重试队列与校验事实。未采集到、已过平台可恢复期、Mac原目录丢失的资料无法凭空备份。Mac额外代码需同步至服务器 mac-mirror；过旧或未同步必须报告。

认证：服务器 `/home/ubuntu/.config/banyuexuan-backup/github-token`，600，不在仓库。账号只需目标私有仓库Contents读写；首次创建仓库使用所有者认证。恢复私钥仅在所有者Mac独立目录，必须由所有者另存离线介质；服务器仅安装公钥 operations/encryption-public.pub。

当前使用所有者已授权的GitHub CLI OAuth登录凭证，权限可能大于单仓库。建议所有者后续换成仅限本仓库Contents读写的细粒度凭证。不要在聊天提供令牌，也不要把令牌放入Git URL。Mac后台同步从~/Projects工作目录读取；受保护Documents下旧产物已经过白名单与秘密扫描复制，原资料未删除。备份恢复私钥不用于后台任务。

恢复依赖：二进制 Finance SDK 在加密快照 binary/ 内，恢复时放回 app/archive-worker；SHA-256见manifest。环境凭证不在快照中，需由所有者单独恢复。首份数据解密与媒体验证已通过；完整数据库恢复及约束重建未经执行，不把它列为已通过。

## 完整恢复步骤（仅新隔离环境）

1. 从私有GitHub仓库取代码与交接，从对应Release下载manifest及所有分片。先核对每片bytes/SHA-256，按part000、part001顺序拼接snapshot.enc，再核对整体SHA-256。
2. 安装Python cryptography；运行 `python3 scripts/crypto.py decrypt snapshot.enc snapshot.tar.gz /安全位置/recovery-key.pem`。GCM认证不通过会拒绝并清理临时明文。
3. 在隔离目录解包。运行PostgreSQL17；创建空库 `byx_restore_日期`，用 `database/pre-data.sql` 建结构；运行 `scripts/restore_rows.py database/rows.jsonl --database byx_restore_日期` 装入数据并恢复序列；用 post-data.sql 恢复约束和索引。
4. 对比每张表记录数、群范围、最大序号及附件SHA/MD5；校验外键。媒体恢复到单独测试目录，绝不覆盖生产。pending-media保留待重试事实，不自动判有效。
5. 从所有者凭证库填所需WECOM、Postgres与API凭证（不在聊天输出）；按部署文件搭建隔离环境，禁止客户发送与训练，完成查询、附件与去重测试。
6. 记录恢复时间、版本、失败项和证据。生产切换另行安排；不能直接把空全局archive_state的单群恢复库用于全平台生产采集。

## 成功判据

有本地加密文件 ≠ GitHub备份成功；git push ≠ 数据附件上传成功；Release存在 ≠ 可恢复。分别检查服务器 last-run.json、远端commit、Release分片、SHA-256、GCM解密和隔离恢复约束验证。
