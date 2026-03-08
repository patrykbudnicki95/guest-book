type Step = {
  title: string;
  description: string;
  icon: React.ReactNode;
};

type HowItWorksProps = {
  title: string;
  steps: Step[];
};

export function HowItWorks({ title, steps }: HowItWorksProps) {
  return (
    <section className="border-t bg-muted/30 py-16">
      <div className="container mx-auto px-4">
        <h2 className="mb-12 text-center text-3xl font-bold">{title}</h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <div
              key={i}
              className="flex flex-col items-center text-center"
            >
              <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                {step.icon}
              </div>
              <h3 className="mb-2 font-semibold">{step.title}</h3>
              <p className="text-muted-foreground text-sm">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
