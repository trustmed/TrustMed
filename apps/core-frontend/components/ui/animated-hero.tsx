import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MoveRight } from "lucide-react";
import { Button } from "@/components/ui/button";

function Hero() {
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(() => ["Fully Secure", "Decentralized", "Private"], []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === titles.length - 1) {
        setTitleNumber(0);
      } else {
        setTitleNumber(titleNumber + 1);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  return (
    <div className="w-full">
      <div className="container mx-auto">
        <div className="flex gap-8 py-4 items-center justify-center flex-col">
          <div className="flex gap-4 flex-col">
            <h1 className="text-3xl sm:text-6xl md:text-8xl max-w-5xl tracking-tighter text-center font-regular flex flex-col items-center justify-center">
              <span className="text-foreground mb-2 text-balance">
                Your Medical Records Are
              </span>
              <span className="relative flex w-full justify-center overflow-hidden text-center pb-4 md:pb-8 min-h-[1.4em]">
                &nbsp;
                {titles.map((title, index) => (
                  <motion.span
                    key={title}
                    className="absolute font-semibold bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/70 whitespace-nowrap"
                    initial={{ opacity: 0, y: "-100" }}
                    transition={{ type: "spring", stiffness: 50 }}
                    animate={
                      titleNumber === index
                        ? {
                            y: 0,
                            opacity: 1,
                          }
                        : {
                            y: titleNumber > index ? -150 : 150,
                            opacity: 0,
                          }
                    }
                  >
                    {title}
                  </motion.span>
                ))}
              </span>
            </h1>

            <p className="text-lg md:text-xl leading-relaxed tracking-tight text-muted-foreground max-w-xl mx-auto text-center mb-8">
              Secure, decentralized health records powered by blockchain
              technology. Share your medical history instantly with any
              healthcare provider, while maintaining complete control.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-6 items-center">
            <Button
              size="lg"
              className="gap-2 w-full sm:w-auto bg-primary text-primary-foreground hover:scale-105 transition-all duration-300 shadow-xl shadow-primary/20 rounded-full px-8"
            >
              Start Protecting Your Data <MoveRight className="w-4 h-4 ml-1" />
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="gap-2 w-full sm:w-auto hover:bg-transparent hover:text-foreground/80 group"
            >
              Watch Demo{" "}
              <MoveRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export { Hero };
