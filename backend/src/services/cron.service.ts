import prisma from "../config/db.js";

// Helper to get/set site settings JSON
const getSettingJson = async (key: string, defaultValue: any = []) => {
  try {
    const setting = await prisma.siteSetting.findUnique({ where: { key } });
    if (!setting) return defaultValue;
    return JSON.parse(setting.value);
  } catch (e) {
    return defaultValue;
  }
};

const setSettingJson = async (key: string, value: any) => {
  await prisma.siteSetting.upsert({
    where: { key },
    update: { value: JSON.stringify(value) },
    create: { key, value: JSON.stringify(value) }
  });
};

const monthNamesEn = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const monthNamesSi = [
  "ජනවාරි", "පෙබරවාරි", "මාර්තු", "අප්‍රේල්", "මැයි", "ජූනි",
  "ජූලි", "අගෝස්තු", "සැප්තැම්බර්", "ඔක්තෝබර්", "නොවැම්බර්", "දෙසැම්බර්"
];

export const getAutomatedCronLogs = async () => {
  return await getSettingJson("dana_automated_cron_logs", []);
};

export const runAutomatedDanaRemindersCron = async () => {
  try {
    console.log("⏰ [CRON] Running daily automated Dana reminders check...");
    const today = new Date();

    const date7 = new Date();
    date7.setDate(today.getDate() + 7);

    const date1 = new Date();
    date1.setDate(today.getDate() + 1);

    const datePast1 = new Date();
    datePast1.setDate(today.getDate() - 1);

    const check7Month = monthNamesEn[date7.getMonth()];
    const check7MonthSi = monthNamesSi[date7.getMonth()];
    const check7Day = String(date7.getDate());

    const check1Month = monthNamesEn[date1.getMonth()];
    const check1MonthSi = monthNamesSi[date1.getMonth()];
    const check1Day = String(date1.getDate());

    const checkPast1Month = monthNamesEn[datePast1.getMonth()];
    const checkPast1MonthSi = monthNamesSi[datePast1.getMonth()];
    const checkPast1Day = String(datePast1.getDate());

    const danas = await prisma.danaBooking.findMany({
      where: { status: "APPROVED" },
      include: { 
        user: true,
        payments: {
          where: { status: "APPROVED" }
        }
      }
    });

    const cronLogs = await getSettingJson("dana_automated_cron_logs", []);
    let newDispatches = 0;

    for (const dana of danas) {
      const dMonth = dana.month.trim();
      const dDay = dana.day.trim();

      const isMatch7 = (dMonth === check7Month || dMonth === check7MonthSi) && dDay === check7Day;
      const isMatch1 = (dMonth === check1Month || dMonth === check1MonthSi) && dDay === check1Day;
      const isMatchPast1 = (dMonth === checkPast1Month || dMonth === checkPast1MonthSi) && dDay === checkPast1Day;

      let reminderType = "";
      if (isMatch7) reminderType = "7_DAYS_PRIOR";
      else if (isMatch1) reminderType = "1_DAY_PRIOR";
      else if (isMatchPast1) reminderType = "POST_DANA_THANKYOU";

      if (reminderType) {
        // Condition: POST_DANA_THANKYOU e-Certificate message is ONLY sent if donor has deposited/completed payment
        if (reminderType === "POST_DANA_THANKYOU") {
          const hasApprovedPayment = dana.payments && dana.payments.length > 0;
          if (!hasApprovedPayment) {
            console.log(`ℹ️ [CRON] Skipping POST_DANA_THANKYOU for Dana #${dana.id} (${dana.name}) - No approved payment found.`);
            continue;
          }
        }

        const logId = `${dana.id}_${reminderType}_${today.toISOString().split("T")[0]}`;
        const alreadySent = cronLogs.some((l: any) => l.logId === logId);

        if (!alreadySent) {
          const donorPhone = dana.whatsapp !== "N/A" ? dana.whatsapp : dana.phone !== "N/A" ? dana.phone : dana.user?.whatsapp || dana.user?.phone || "";
          const confirmUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/dana/confirm/${dana.id}`;

          let messageText = "";
          let voiceNoteUrl = "";

          if (reminderType === "7_DAYS_PRIOR") {
            messageText = `තෙරුවන් සරණයි! කන්දෙගම ඓතිහාසික ධනංජය රජමහා විහාරස්ථ සාගරමති පිරිවෙනේ නේවාසික මහා සංඝරත්නයේ දානය උදෙසා ඔබ විසින් බාරගන්නා ලද දානමය පුණ්‍යකර්මය තව දින 7කින් (${dana.month} මස ${dana.day} වන දින) යෙදී ඇත. ඔබේ පැමිණීම තහවුරු කිරීමට මෙතැනින් පිවිසෙන්න: ${confirmUrl}`;
            voiceNoteUrl = "/audio/dana_reminder_7days.mp3";
          } else if (reminderType === "1_DAY_PRIOR") {
            messageText = `තෙරුවන් සරණයි! හෙට (${dana.month} මස ${dana.day} වන දින) කන්දෙගම සාගරමති පිරිවෙනේ ඔබේ දානමය පුණ්‍යකර්මය යෙදී ඇති බවත් මහා සංඝරත්නය වඩමවන බවත් කාරුණිකව මතක් කර සිටිමු. පැමිණීම තහවුරු කිරීමට: ${confirmUrl}`;
            voiceNoteUrl = "/audio/dana_reminder_1day.mp3";
          } else if (reminderType === "POST_DANA_THANKYOU") {
            messageText = `තෙරුවන් සරණයි! කන්දෙගම සාගරමති පිරිවෙනේ පැවැත්වූ දානමය පුණ්‍යකර්මය වෙනුවෙන් අපගේ ප්‍රණාමය පුද කරමු. ඔබේ පින් අනුමෝදන් ශ්‍රී සන්නස් පත්‍රය (PDF e-Certificate) ලබා ගැනීමට: ${confirmUrl}`;
            voiceNoteUrl = "/audio/dana_post_thankyou.mp3";
          }


          const dispatchEntry = {
            logId,
            danaBookingId: dana.id,
            donorName: dana.name,
            phone: donorPhone,
            reminderType,
            messageText,
            voiceNoteUrl,
            confirmUrl,
            dispatchedAt: new Date().toISOString()
          };

          cronLogs.unshift(dispatchEntry);
          newDispatches++;
        }
      }
    }

    if (newDispatches > 0) {
      await setSettingJson("dana_automated_cron_logs", cronLogs);
      console.log(`✅ [CRON] Successfully dispatched ${newDispatches} automated reminders.`);
    } else {
      console.log("ℹ️ [CRON] No new reminders to dispatch today.");
    }

    return { success: true, newDispatches, totalLogs: cronLogs.length };
  } catch (error) {
    console.error("❌ [CRON] Error running automated Dana reminders cron:", error);
    return { success: false, error };
  }
};

// Automatic 12-hour interval schedule while server is running
setInterval(() => {
  runAutomatedDanaRemindersCron();
}, 12 * 60 * 60 * 1000);

