import prisma from "./src/config/db.js";

async function main() {
  const updates = [
    {
      key: 'letter_body_p1_si',
      value: 'කන්දෙගම ඓතිහාසික ධනංජය රජමහා විහාරස්ථ සාගරමති පිරිවෙනේ නේවාසික මහා සංඝරත්නයේ සිව්පසය උදෙසා {recipient} විසින් ඉදිරිපත්ව දායකත්වය ලබාදීම පිළිබඳව අපගේ ප්‍රණාමය පුද කරමු.'
    },
    {
      key: 'letter_body_p2_si',
      value: 'ඒ අනුව, සෑම වසරකම {month} මස {day} වන දින "{purpose}" සඳහා වන දානමය දායකත්වය {recipient_possessive} නමින් වෙන් කර ඇති බව කාරුණිකව මතක් කර සිටිමු.'
    },
    {
      key: 'letter_body_p3_si',
      value: 'එබැවින්, මෙවර {year} වසරේ {month} මස {day} වන දිනට යෙදෙන ඔබගේ {meal_type} සඳහා මහා සංඝරත්නය වඩමවන බව දැනුම් දෙමු. ඔබට පැමිණ දානය පූජා කිරීමට හෝ පහත සඳහන් විහාරස්ථ බැංකු ගිණුමට ආධාර තැන්පත් කිරීමට හැක. ගිණුමට මුදල් බැර කරන්නේ නම්, රිසිට් පතෙහි පිටපතක් දුරකථනයෙන්, ලිපිනෙන්, Email හෝ Whatsapp මගින් අප වෙත එවීමට කාරුණික වන්න. හීල් සහ දවල් දානමය වියදම ආසන්න වශයෙන් රුපියල් 5000 ක් පමණ වේ.'
    }
  ];

  for (const item of updates) {
    await prisma.siteSetting.upsert({
      where: { key: item.key },
      update: { value: item.value },
      create: { key: item.key, value: item.value },
    });
    console.log(`Updated DB: ${item.key}`);
  }

  console.log("Database updated successfully with new Sinhala salutations & pronouns!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
