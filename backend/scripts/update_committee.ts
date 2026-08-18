import prisma from "./src/config/db.js";

async function main() {
  const updates = [
    { key: 'letter_patron_1_si', value: 'අනුශාසක :  පූජ්‍ය ගෝණවල සුදස්සීලංකාර නාහිමිපාණෝ' },
    { key: 'letter_patron_2_si', value: 'ප්‍රධාන සභාපති : පූජ්‍ය කන්දේගම දීපවංසාලංකාර හිමි' },
    { key: 'letter_patron_3_si', value: 'ප්‍රධාන ලේකම් : පූජ්‍ය හොරණ විජයවංසාලංකාර හිමි' },
    { key: 'letter_patron_4_si', value: 'භාණ්ඩාගාරික : එච්. එම්. ගුණපාල මහතා' },
    { key: 'letter_president_si', value: 'ප්‍රධාන සංවිධායක : කේ. ජී. සී. ගුණවර්ධන මහතා' },

    { key: 'letter_patron_1', value: 'Patron: Ven. Gonawala Sudassilankara Nahimipano' },
    { key: 'letter_patron_2', value: 'Chief President: Ven. Kandegama Deepawansalankara Thero' },
    { key: 'letter_patron_3', value: 'Chief Secretary: Ven. Horana Vijayawansalankara Thero' },
    { key: 'letter_patron_4', value: 'Treasurer: Mr. H. M. Gunapala' },
    { key: 'letter_president', value: 'Chief Organizer: Mr. K. G. C. Gunawardena' },
  ];

  for (const item of updates) {
    await prisma.siteSetting.upsert({
      where: { key: item.key },
      update: { value: item.value },
      create: { key: item.key, value: item.value },
    });
    console.log(`Updated ${item.key} -> ${item.value}`);
  }

  console.log("All DB settings updated successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
