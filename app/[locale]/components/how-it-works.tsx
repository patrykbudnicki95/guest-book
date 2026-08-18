type Step = {
  title: string;
  description: string;
  icon: React.ReactNode;
};

type HowItWorksProps = {
  title: string;
  subtitle?: string;
  steps: Step[];
};

export function HowItWorks({ title, subtitle, steps }: HowItWorksProps) {
  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <h2 className="mb-3 text-3xl font-bold md:text-4xl">{title}</h2>
          {subtitle && (
            <p className="mx-auto max-w-2xl text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>
        <div className="relative mx-auto max-w-5xl">
          <div className="absolute left-0 right-0 top-10 hidden h-0.5 bg-linear-to-r from-transparent via-primary/20 to-transparent lg:block" />
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <div
                key={i}
                className="group relative flex flex-col items-center text-center"
              >
                <div className="relative mb-6 flex size-20 items-center justify-center rounded-full bg-white shadow-lg ring-4 ring-primary/10 transition-all group-hover:ring-primary/25 group-hover:shadow-xl">
                  <div className="text-primary">{step.icon}</div>
                  <span className="absolute -right-1 -top-1 flex size-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {i + 1}
                  </span>
                </div>
                <h3 className="mb-2 text-base font-semibold">{step.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
