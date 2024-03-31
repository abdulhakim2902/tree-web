import classNames from "classnames";
import Link from "next/link";
import { FC } from "react";
import s from "./Button.module.css";

type ButtonProps = {
  href?: string;
  text: string;
  className?: string;
  isSecondary?: boolean;
  newTab?: boolean;
  onClick?: () => void;
};

const Button: FC<ButtonProps> = ({ href = "", text, className, isSecondary, newTab, onClick }) => (
  <Link
    href={href}
    onClick={onClick}
    target={newTab ? "_blank" : undefined}
    rel={newTab ? "noopener noreferer" : undefined}
    className={classNames(s.button, className, {
      [s.secondaryButton]: isSecondary,
    })}
  >
    {text}
  </Link>
);

export default Button;
