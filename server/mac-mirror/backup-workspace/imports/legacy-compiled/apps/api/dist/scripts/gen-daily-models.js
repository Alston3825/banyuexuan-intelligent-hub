"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assessment_specs_1 = require("../src/care/care-assessment/assessment-specs");
const daily_specs_1 = require("../src/care/care-daily/daily-specs");
const prismaType = (f) => {
    switch (f.kind) {
        case 'text':
        case 'single':
            return 'String?';
        case 'longtext':
            return 'String? @db.Text';
        case 'int':
            return 'Int?';
        case 'decimal':
            return 'Float?';
        case 'date':
            return 'DateTime? @db.Date';
        case 'multi':
            return 'Json?';
    }
};
const col = (f) => `  ${f.key} ${prismaType(f)} @map("${(0, assessment_specs_1.columnName)(f.key)}") // ${f.label}`;
const motherCols = daily_specs_1.DAILY_MOTHER_FIELDS.flatMap((g) => g.fields).map(col).join('\n');
const babyCols = daily_specs_1.DAILY_BABY_FIELDS.flatMap((g) => g.fields).map(col).join('\n');
const feedCols = daily_specs_1.FEEDING_COLUMNS.map(col).join('\n');
console.log(`/// 日常护理记录（妈妈那一栏）：一个妈妈档案每天一条，住几天就有几条。字段见 care-daily/daily-specs.ts。
model CareDailyRecord {
  id String @id @default(cuid())
  tenantId String @map("tenant_id")
  storeId String @map("store_id")
  motherProfileId String @map("mother_profile_id")
  recordDate DateTime @map("record_date") @db.Date
  stayDay Int? @map("stay_day") // 入住第几天（创建时按入住日算出，可改）
  documentId String? @map("document_id") // 纸质原件照片（可为空）
${motherCols}
  createdBy String @map("created_by")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  version Int @default(0)

  motherProfile MotherProfile @relation(fields: [motherProfileId], references: [id])
  document CareDocument? @relation("DailyRecordDocument", fields: [documentId], references: [id])
  babies CareDailyBabyRecord[]

  @@unique([motherProfileId, recordDate])
  @@index([tenantId, storeId, recordDate])
  @@map("care_daily_records")
}

/// 日常护理记录里每个宝宝的那一栏（多胞胎每个宝宝一条）。
model CareDailyBabyRecord {
  id String @id @default(cuid())
  tenantId String @map("tenant_id")
  storeId String @map("store_id")
  dailyRecordId String @map("daily_record_id")
  babyProfileId String @map("baby_profile_id")
  documentId String? @map("document_id")
${babyCols}
  createdBy String @map("created_by")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  version Int @default(0)

  dailyRecord CareDailyRecord @relation(fields: [dailyRecordId], references: [id], onDelete: Cascade)
  babyProfile BabyProfile @relation(fields: [babyProfileId], references: [id])
  document CareDocument? @relation("DailyBabyRecordDocument", fields: [documentId], references: [id])
  feedings CareFeedingEntry[]

  @@unique([dailyRecordId, babyProfileId])
  @@index([babyProfileId])
  @@map("care_daily_baby_records")
}

/// 24 小时宝宝喂养记录单的一行（一次喂养/排泄）。
model CareFeedingEntry {
  id String @id @default(cuid())
  tenantId String @map("tenant_id")
  babyDailyId String @map("baby_daily_id")
  sortOrder Int @default(0) @map("sort_order")
${feedCols}
  createdAt DateTime @default(now()) @map("created_at")

  babyDaily CareDailyBabyRecord @relation(fields: [babyDailyId], references: [id], onDelete: Cascade)

  @@index([babyDailyId])
  @@map("care_feeding_entries")
}
`);
//# sourceMappingURL=gen-daily-models.js.map