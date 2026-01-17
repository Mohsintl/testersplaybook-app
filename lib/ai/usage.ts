import prisma from "@/lib/prisma";
import { AI_LIMITS } from "./limits";

export class AIUsageError extends Error {
  code: string;
  remaining: number;
  action: string;

  constructor(message: string, remaining: number, action: string) {
    super(message);
    this.name = "AIUsageError";
    this.code = "AI_USAGE_LIMIT";
    this.remaining = remaining;
    this.action = action;
  }
}

export async function checkAndRecordAIUsage(
  userId: string,
  action: keyof typeof AI_LIMITS
) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const usedToday = await prisma.aIUsage.count({
    where: {
      userId,
      action,
      createdAt: {
        gte: today,
      },
    },
  });

  const perDay = AI_LIMITS[action].perDay;
  const remaining = Math.max(perDay - usedToday, 0);

  if (usedToday >= perDay) {
    throw new AIUsageError(
      `Daily AI limit reached for ${action}. Try again tomorrow.`,
      0,
      action
    );
  }

  await prisma.aIUsage.create({
    data: {
      userId,
      action,
    },
  });

  return { remaining: remaining - 1 };
}
