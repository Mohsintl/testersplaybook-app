import prisma from "@/lib/prisma";
import { AI_LIMITS } from "./limits";

export async function checkAndRecordAIUsage(
  userId: string,
  action: keyof typeof AI_LIMITS
) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const usedToday = await prisma.AIUsage.count({
    where: {
      userId,
      action,
      createdAt: {
        gte: today,
      },
    },
  });

  if (usedToday >= AI_LIMITS[action].perDay) {
    throw new Error(
      `Daily AI limit reached for ${action}. Try again tomorrow.`
    );
  }

  await prisma.AIUsage.create({
    data: {
      userId,
      action,
    },
  });
}
