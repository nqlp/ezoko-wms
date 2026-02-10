-- Add PUTAWAY activity type for mobile putaway workflow
ALTER TYPE "Activity" ADD VALUE IF NOT EXISTS 'Putaway';
