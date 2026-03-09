import React from 'react';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

interface PrivacyPolicyProps {
  onBack: () => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-2xl px-6 py-12 mx-auto"
    >
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors mb-8 group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        <span className="font-bold text-sm">Tilbake</span>
      </button>

      <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-slate-100">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold text-slate-900">Personvern</h1>
            <p className="text-sm text-slate-400 font-medium">Sist oppdatert: 9. mars 2026</p>
          </div>
        </div>

        <div className="prose prose-slate max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">1. Behandlingsansvarlig</h2>
            <p className="text-slate-600 leading-relaxed">
              PrisSjekk, Norge. Kontakt: hei@prissjekk.no.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">2. Hvilke opplysninger vi kan samle inn</h2>
            <ul className="list-disc pl-5 text-slate-600 space-y-2">
              <li>Konto- og profildata (navn, e-post, brukernavn, bilde).</li>
              <li>Innhold du legger inn (kvitteringer, tekst, tilbakemeldinger, data fra bruk).</li>
              <li>Bruks- og teknisk data (enhet, IP, nettleser, appaktivitet).</li>
              <li>Lokasjon der du tillater det.</li>
              <li>Data vi mottar fra partnere eller offentlige kilder.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">3. Hvorfor vi behandler data</h2>
            <p className="text-slate-600 leading-relaxed">
              For å levere, forbedre og utvikle PrisSjekk, analysere bruk, tilpasse innhold, kommunisere med deg, drive markedsføring, sikre drift og oppfylle lovkrav.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">4. Deling, samarbeid og salg av data</h2>
            <p className="text-slate-600 leading-relaxed">
              Vi kan dele, lisensiere eller selge personopplysninger til leverandører, samarbeidspartnere og tredjeparter for drift, analyse, markedsføring, forskning eller andre kommersielle formål. Vi kan også dele aggregerte eller anonymiserte data. Ved fusjon, salg eller omorganisering kan data overføres som del av virksomheten.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">5. Lagring og internasjonal overføring</h2>
            <p className="text-slate-600 leading-relaxed">
              Data kan behandles i og utenfor Norge/EØS. Vi lagrer data så lenge det er nødvendig for formålene over, eller så lenge loven krever det.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">6. Dine rettigheter</h2>
            <p className="text-slate-600 leading-relaxed">
              Du kan be om innsyn, retting, sletting, begrensning eller protestere mot behandling. Kontakt oss på hei@prissjekk.no.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">7. Informasjonskapsler</h2>
            <p className="text-slate-600 leading-relaxed">
              Vi kan bruke informasjonskapsler og lignende teknologi for funksjonalitet, analyse og markedsføring.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">8. Endringer</h2>
            <p className="text-slate-600 leading-relaxed">
              Vi kan oppdatere denne erklæringen ved behov. Endringer trer i kraft når de publiseres.
            </p>
          </section>

          <section className="pt-8 border-t border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 mb-3">9. Kontakt</h2>
            <p className="text-slate-600">
              E-post: hei@prissjekk.no<br />
              Support: support@prissjekk.no
            </p>
          </section>
        </div>
      </div>
    </motion.div>
  );
};
