/**
 * Styles article bodies from a single place so the content files stay plain JSX.
 * Written as descendant utilities instead of pulling in a typography plugin.
 */
const proseClasses = [
  "max-w-2xl text-base leading-relaxed text-muted-foreground",
  "[&>h2]:mb-4 [&>h2]:mt-12 [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-foreground [&>h2]:md:text-3xl",
  "[&>h3]:mb-3 [&>h3]:mt-8 [&>h3]:text-lg [&>h3]:font-semibold [&>h3]:text-foreground",
  "[&>p]:mb-5",
  "[&>ul]:mb-6 [&>ul]:space-y-2 [&>ul]:pl-5",
  "[&>ul>li]:list-disc [&>ul>li]:marker:text-primary",
  "[&>ol]:mb-6 [&>ol]:space-y-2 [&>ol]:pl-5",
  "[&>ol>li]:list-decimal [&>ol>li]:marker:text-muted-foreground",
  "[&_strong]:font-semibold [&_strong]:text-foreground",
  "[&_a]:font-medium [&_a]:text-primary [&_a]:underline-offset-4 [&_a:hover]:underline",
  "[&>blockquote]:my-6 [&>blockquote]:rounded-r-lg [&>blockquote]:border-l-4 [&>blockquote]:border-primary/30 [&>blockquote]:bg-muted/40 [&>blockquote]:px-5 [&>blockquote]:py-4 [&>blockquote]:italic",
].join(" ");

export function Prose({ children }: { children: React.ReactNode }) {
  return <div className={proseClasses}>{children}</div>;
}
