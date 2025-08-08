import { useTranslation } from "react-i18next";

// Main HomeSection Component
const bgImage = "/images/home_bg.svg";

const HomeSection = () => {
  const { t } = useTranslation();
  return (
    <section
      className="relative max-lg:bg-primary lg:bg-[#C1B9AE]  lg:h-[calc(100lvh-70px)] py-8 sm:py-12 lg:py-20 px-4 sm:px-6 lg:px-8"
      style={{ 
        backgroundImage: `url(${bgImage})`, 
        backgroundSize: "cover", 
        backgroundPosition: "center"
      }}
      aria-label="Home Section"
    >
      <div className="container mx-auto max-w-8xl h-full">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 h-full min-h-[calc(100lvh-150px)]">
          {/* Form Section */}
          <div className="w-full lg:w-1/2 flex justify-center lg:justify-start order-2 lg:order-1">
            <div className="flex-1 md:pr-12 max-w-xl text-center md:text-left">
              <h1 className="md:text-6xl text-4xl font-extrabold mb-6 md:!leading-[75px]">
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
                <button className="bg-gradient-to-r bg-dark-blue text-white px-8 py-3 rounded-full font-semibold shadow-md hover:bg-white hover:text-title cursor-pointer transition">
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
