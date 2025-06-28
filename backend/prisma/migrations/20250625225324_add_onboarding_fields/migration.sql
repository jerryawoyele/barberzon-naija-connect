-- DropForeignKey
ALTER TABLE "Barber" DROP CONSTRAINT "Barber_shopId_fkey";

-- AlterTable
ALTER TABLE "Barber" ADD COLUMN     "completedOnboarding" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "shopId" DROP NOT NULL,
ALTER COLUMN "hourlyRate" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "completedOnboarding" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "Barber" ADD CONSTRAINT "Barber_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE SET NULL ON UPDATE CASCADE;
