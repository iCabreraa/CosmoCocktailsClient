"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";

export default function TeamSection() {
  const { t, isInitialized } = useLanguage();

  const team = [
    {
      name: "Alex",
      role: t("about.team_founder"),
      // img: "",
    },
    {
      name: "Mickey",
      role: t("about.team_cofounder"),
      // img: "",
    },
    {
      name: "Ivan",
      role: t("about.team_developer"),
      // img: "",
    },
  ];

  if (!isInitialized) {
    return (
      <section className="py-16 md:py-24 px-6" id="team">
        <div className="max-w-5xl mx-auto flex flex-col gap-8 text-center">
          <div className="h-12 bg-slate-700/30 rounded animate-pulse"></div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex flex-col items-center gap-3">
                <div className="h-6 w-20 bg-slate-700/20 rounded animate-pulse"></div>
                <div className="h-4 w-32 bg-slate-700/20 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

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
          {t("about.team_title")}
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
