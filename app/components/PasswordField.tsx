import * as React from "react";
import { useDisclosure } from "./useDisclosure";
import { type InputProps, inputVariants } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { cn } from "~/utils/misc";
import { Icon } from "./ui/icon";

type PasswordFieldProps = InputProps & {
  id?: string;
  name: string;
  label: string;
};

export const PasswordField = React.forwardRef<
  HTMLInputElement,
  PasswordFieldProps
>(({ name, id, label, children, isInvalid, className, ...props }, ref) => {
  id = id || name;

  const { isOpen, onToggle } = useDisclosure();

  const onClickReveal = () => {
    onToggle();
  };

  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <input
          id={id}
          ref={ref}
          name={name}
          type={isOpen ? "text" : "password"}
          autoComplete="current-password"
          required
          aria-invalid={isInvalid}
          className={cn(
            inputVariants({ variant: isInvalid ? "error" : "default" }),
            "flex items-center pr-16",
            className,
          )}
          {...props}
        />
        <Button
          variant="link"
          type="button"
          className="absolute right-0 top-0 h-full flex items-center justify-center"
          aria-label={isOpen ? "Mask password" : "Reveal password"}
          children={isOpen ? <Icon name="eye-off" /> : <Icon name="eye" />}
          onClick={onClickReveal}
        />
      </div>
      {children}
    </div>
  );
});

PasswordField.displayName = "PasswordField";
