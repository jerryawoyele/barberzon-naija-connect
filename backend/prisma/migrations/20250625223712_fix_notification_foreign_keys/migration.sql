-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_barber_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_customer_fkey";

-- DropForeignKey
ALTER TABLE "PushToken" DROP CONSTRAINT "PushToken_barber_fkey";

-- DropForeignKey
ALTER TABLE "PushToken" DROP CONSTRAINT "PushToken_customer_fkey";

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "barberId" TEXT,
ADD COLUMN     "customerId" TEXT;

-- AlterTable
ALTER TABLE "PushToken" ADD COLUMN     "barberId" TEXT,
ADD COLUMN     "customerId" TEXT;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_customer_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_barber_fkey" FOREIGN KEY ("barberId") REFERENCES "Barber"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PushToken" ADD CONSTRAINT "PushToken_customer_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PushToken" ADD CONSTRAINT "PushToken_barber_fkey" FOREIGN KEY ("barberId") REFERENCES "Barber"("id") ON DELETE SET NULL ON UPDATE CASCADE;
