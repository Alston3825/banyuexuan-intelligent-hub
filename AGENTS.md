# 接手约束

项目名称：伴月轩智能中枢。业务时区 Asia/Shanghai；所有者 Mac 为 America/Los_Angeles；动态处理夏令时，勿硬编码15/16小时。

1. 读 HANDOFF.md、HANDOFF-AUTO.md、progress/LATEST.json、docs/BACKUP-RESTORE.md。先检查事实与实际部署差异。
2. 仅授权正式群 room_id=wrPPybcQAAh0UjrU0aSK-BdQpYi9kdFg；禁止查询其他群来填补序号缺口。
3. 原始 messages/attachments 不手工改写。内部案例库通过既有 ingest_review(jsonb) 事务、去重、审计；未经核验不宣称成功。
4. 客户首个真实文字问题固定24小时包；独立子问题与不同孩子区分；晚答关联原包；感谢不是改善；撤回正文不用于展示；图片关联待判断。
5. 专业内容只记录主任原意，不自动专业审核通过；当前草稿不用于客户发送、公开发布或训练。
6. 密钥及客户原始资料不写入文档、Git、日志、提交消息。环境凭证通过所有者凭证库恢复。
7. 每次实质开发更新 HANDOFF.md（下一步、阻塞、验证、回滚）与 progress/，提交前运行备份秘密扫描。不得把推测写成已完成。
8. GitHub 必须 private；不得 force push、清除旧备份或自动部署客户页面。恢复测试只用 byx_restore_* 隔离数据库。
9. 不以容器 healthy、定时器 active、任务已触发代替采集、提交或恢复成功。依次核对来源、数量、哈希、远端提交和附件。
