/*
  Warnings:

  - You are about to drop the column `notes` on the `Interaction` table. All the data in the column will be lost.
  - You are about to drop the column `interest` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `preferredZone` on the `Lead` table. All the data in the column will be lost.
  - Made the column `source` on table `Lead` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Interaction" DROP COLUMN "notes";

-- AlterTable
ALTER TABLE "Lead" DROP COLUMN "interest",
DROP COLUMN "preferredZone",
ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ALTER COLUMN "temperature" SET DEFAULT 'COLD',
ALTER COLUMN "source" SET NOT NULL,
ALTER COLUMN "source" SET DEFAULT 'MANUAL',
ALTER COLUMN "budget" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "PropertyUnit" ADD COLUMN     "features" TEXT[],
ALTER COLUMN "type" SET DEFAULT 'APARTMENT',
ALTER COLUMN "floor" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "phone" TEXT;
