-- AlterEnum
ALTER TYPE "LeadTemperature" ADD VALUE 'NONE';

-- AlterTable
ALTER TABLE "Lead" ALTER COLUMN "temperature" DROP NOT NULL,
ALTER COLUMN "temperature" DROP DEFAULT;
