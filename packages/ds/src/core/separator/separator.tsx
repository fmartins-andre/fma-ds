import { cn } from "cn";
import { Separator as SeparatorPrimitive } from "react-aria-components";

// The orientation picks plain classes instead of aria-[orientation=*] variants:
// an attribute variant outranks a utility, so a `self-center` or `h-4` passed in
// `className` would lose to the default and cn() couldn't merge them.
const ORIENTATION_CLASSES = {
  horizontal: "h-px w-full",
  vertical: "w-px self-stretch",
} as const;

function Separator({
  className,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive>) {
  return (
    <SeparatorPrimitive
      data-slot="separator"
      orientation={orientation}
      className={cn(
        "block shrink-0 border-0 bg-border",
        ORIENTATION_CLASSES[orientation],
        className,
      )}
      {...props}
    />
  );
}

export { Separator };
