"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";

const team = [
  {
    name: "Alex",
    role: "Founder & Head Mixologist",
    // img: "",
  },
  {
    name: "Mickey",
    role: "Co-founder & Head Mixologist",
    // img: "",
  },
  {
    name: "Ivan",
    role: "Mixologist & Web Developer",
    // img: "",
  },
];

export default function TeamSection() {
  const { t } = useLanguage();
  return (
    <section className="py-16 md:py-24 px-6" id="team">
      <div className="max-w-5xl mx-auto flex flex-col gap-8 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-[--font-unica] text-[#D8DAE3]"
        >
          {t("about.values_title")}
        </motion.h2>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-8"
        >
          {team.map(member => (
            <div key={member.name} className="flex flex-col items-center gap-3">
              {/* <div className="w-32 h-32 relative rounded-full overflow-hidden">
                <Image
                  src={member.img}
                  alt={member.name}
                  fill
                  className="object-cover"
                />
              </div> */}
              <p className="font-[--font-josefin] text-cosmic-silver text-lg">
                {member.name}
              </p>
              <p className="text-sm text-cosmic-fog">{member.role}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
