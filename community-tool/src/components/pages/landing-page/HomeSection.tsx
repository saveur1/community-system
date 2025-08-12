import { animate } from "framer-motion";
import { useTranslation } from "react-i18next";

// Main HomeSection Component
const bgImage = "/images/home_bg.svg";

const HomeSection = () => {
  const { t } = useTranslation();

  // Smooth scroll to section by id
  const handleSmoothScroll = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 70; // offset for sticky header
      animate(window.scrollY, y, {
        duration: 0.7,
        onUpdate: (v) => window.scrollTo(0, v),
      });
    }
  };

  return (
    <section
      className="relative max-lg:bg-primary lg:bg-[#C1B9AE] lg:min-h-[calc(100lvh-70px)] lg:py-12 lg:px-8 max-lg:p-0 flex flex-col items-center justify-center w-full"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}
      aria-label="Home Section"
    >
      <div className="w-full">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 h-full min-h-[calc(100lvh-150px)]">
          {/* Welcome Section */}
          <div className="w-full lg:w-1/2 max-lg:p-4 flex justify-center max-2xl:pr-10 lg:justify-start order-2 lg:order-1">
            <div className="flex-1 lg:pr-12 lg:max-w-xl text-center md:text-left">
              <h1 className="md:text-5xl text-3xl font-extrabold mb-6 md:!leading-[65px]">
                <span className="text-white">
                  <span className="text-dark-blue">{t('hero.together')}</span> {t('hero.every')}
                </span>
                <span className="text-white/90">
                  {" "} {t('hero.voice_counts')}
                </span>
              </h1>
              <p className="text-white/80 mt-4 text-lg md:text-lg max-w-2xl text-justify">
                {t('hero.description')}
              </p>
              <div className="flex justify-center md:justify-start items-center flex-wrap gap-6 mt-6 text-sm text-white/80">
                <div className="flex items-center gap-2">
                  <span>🔍</span>
                  <span>{t('hero.transparent')} •</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🤝</span>
                  <span>{t('hero.inclusive')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>📣</span>
                  <span>{t('hero.actionable')}</span>
                </div>
              </div>
              <div className="mt-8">
                <button
                  className="bg-gradient-to-r bg-dark-blue text-white px-8 py-3 rounded-full font-semibold shadow-md hover:bg-white hover:text-title cursor-pointer transition"
                  onClick={e => handleSmoothScroll(e, "about")}>
                  {t('hero.feedback')}
                </button>
              </div>
            </div>
          </div>

          {/*  Video Section */}
          <div className="w-full relative lg:w-1/2 flex justify-center lg:justify-end items-center order-1 lg:order-2">
            <video
              src="/videos/rich.mp4"
              className="w-full h-full object-cover bottom-10"
              autoPlay
              muted
              loop
              playsInline
            />
            <div className="w-full h-2 bg-[#C1B9AE] absolute -bottom-1 left-0"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeSection;
