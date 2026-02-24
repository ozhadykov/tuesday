-- AlterTable
ALTER TABLE "Column" ADD COLUMN     "color" TEXT NOT NULL DEFAULT '#zinc-500',
ALTER COLUMN "order" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "deadline" TEXT,
ADD COLUMN     "owner" TEXT NOT NULL DEFAULT 'Unassigned',
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'Not Started',
ALTER COLUMN "order" SET DEFAULT 0;
