/*
  Warnings:

  - You are about to drop the column `features` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Property` table. All the data in the column will be lost.
  - Added the required column `name` to the `Property` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Property" DROP COLUMN "features",
DROP COLUMN "location",
DROP COLUMN "title",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "advisorId" TEXT,
ADD COLUMN     "amenities" TEXT[],
ADD COLUMN     "availability" TEXT,
ADD COLUMN     "bathrooms" INTEGER,
ADD COLUMN     "bedrooms" TEXT,
ADD COLUMN     "builtArea" DECIMAL(65,30),
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'USD',
ADD COLUMN     "deliveryDate" TIMESTAMP(3),
ADD COLUMN     "equipment" TEXT[],
ADD COLUMN     "exchangeRate" DECIMAL(65,30) DEFAULT 6.96,
ADD COLUMN     "garages" INTEGER,
ADD COLUMN     "landArea" DECIMAL(65,30),
ADD COLUMN     "longDescription" TEXT,
ADD COLUMN     "mapUrl" TEXT,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "paymentMethods" TEXT[],
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "pricePerSqmFrom" DECIMAL(65,30),
ADD COLUMN     "pricePerSqmTo" DECIMAL(65,30),
ADD COLUMN     "transaction" TEXT NOT NULL DEFAULT 'SALE',
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'PROJECT',
ADD COLUMN     "zone" TEXT,
ALTER COLUMN "price" DROP NOT NULL;
