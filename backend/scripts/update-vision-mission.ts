import prisma from "../src/config/db.js";

const NEW_VISION = `ගුණාත්මක අධ්‍යාපනයෙන් හා ආධ්‍යාත්මික සංවර්ධනයෙන් කලාපයේ ප්‍රමුඛතම භික්ෂු අධ්‍යාපන මධ්‍යස්ථානය බවට පත්වීම.

To become the prominent Bhikkhu education center of the zone in quality and spiritual development.`;

const NEW_MISSION = `ලොව සදාචාරාත්මක හර පද්ධතීන්ට ගරු කරමින් විවෘත දෑසකින් හා සංවේදී මනසකින් මෙන් ම පිරිපුන් බුද්ධියකින් අනාගත ලෝකයේ අභියෝගයන්ට සාර්ථකව මුහුණ දිය හැකි ගුණ නැණ සපිරි මානව ප්‍රජාවක් ලොවට බිහි කිරීම අපගේ ඒකායන අරමුණයි.

Our main purpose is to create a human virtuous community endowed with intellect, sensitivity, open-mindedness and matured capability to face future challenges successfully upholding moral values.`;

async function main() {
  console.log("Updating Vision & Mission in database...");

  await prisma.siteSetting.upsert({
    where: { key: "vision" },
    update: { value: NEW_VISION },
    create: { key: "vision", value: NEW_VISION }
  });

  await prisma.siteSetting.upsert({
    where: { key: "mission" },
    update: { value: NEW_MISSION },
    create: { key: "mission", value: NEW_MISSION }
  });

  console.log("✅ Database successfully updated with official Vision and Mission text!");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Failed to update database:", err);
  process.exit(1);
});
