import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MoveRight } from "lucide-react";
import { Button } from "@/components/ui/button";

function Hero() {
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(
    () => ["Under Your Control", "Fully Secure", "Decentralized", "Private"],
    []
  );

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
          <div>
            <Button
              variant="secondary"
              size="sm"
              className="gap-4 pointer-events-none"
            >
              🔒 Privacy-First Healthcare
            </Button>
          </div>
          <div className="flex gap-4 flex-col">
            <h1 className="text-3xl sm:text-5xl md:text-7xl max-w-2xl tracking-tighter text-center font-regular">
              <span className="text-foreground">Your Medical Records,</span>
              <span className="relative flex w-full justify-center overflow-hidden text-center md:pb-4 md:pt-1">
                &nbsp;
                {titles.map((title, index) => (
                  <motion.span
                    key={title}
                    className="absolute font-semibold bg-clip-text text-transparent bg-linear-to-r from-muted-foreground to-foreground"
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

            <p className="text-base md:text-xl leading-relaxed tracking-tight text-muted-foreground max-w-2xl text-center">
              Secure, decentralized health records powered by blockchain
              technology. Share your medical history instantly with any
              healthcare provider, while maintaining complete control and
              transparency.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              size="lg"
              className="gap-4 w-full sm:w-auto bg-foreground text-background hover:bg-foreground/90"
            >
              Start Protecting Your Data <MoveRight className="w-4 h-4" />
            </Button>
            <Button
              size="lg"
              className="gap-4 w-full sm:w-auto"
              variant="outline"
            >
              Watch Demo <MoveRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export { Hero };
