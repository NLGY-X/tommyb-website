"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { useCart } from "./CartContext";

export type CheckoutStep = "basket" | "details" | "confirmed";

export interface CheckoutDetails {
  name: string;
  email: string;
}

export interface UseCheckoutOptions {
  onConfirmed?: (orderRef: string) => void;
}

export interface Checkout {
  step: CheckoutStep;
  setStep: (step: CheckoutStep) => void;
  details: CheckoutDetails;
  setDetails: Dispatch<SetStateAction<CheckoutDetails>>;
  confirm: () => void;
  orderRef: string | null;
  error: string | null;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function buildOrderRef(
  name: string,
  subtotal: number,
  salt = 0,
): string {
  const pence = Math.round(subtotal * 100);
  const seed = name.length * 131 + pence * 7 + salt;
  return "TB-" + String(1000 + (seed % 9000));
}

export function useCheckout(options: UseCheckoutOptions = {}): Checkout {
  const { onConfirmed } = options;
  const cart = useCart();
  const [step, setStepState] = useState<CheckoutStep>("basket");
  const [details, setDetails] = useState<CheckoutDetails>({
    name: "",
    email: "",
  });
  const [orderRef, setOrderRef] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const setStep = (next: CheckoutStep) => {
    setError(null);
    setStepState(next);
  };

  const confirm = () => {
    const name = details.name.trim();
    const email = details.email.trim();
    if (name.length === 0) {
      setError("Enter your name.");
      return;
    }
    if (!EMAIL_PATTERN.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    /* Date.now is fine here: this runs in an event handler, not during render. */
    const ref = buildOrderRef(name, cart.subtotal, Date.now() % 9000);
    cart.clear();
    setOrderRef(ref);
    setError(null);
    setStepState("confirmed");
    if (onConfirmed) {
      onConfirmed(ref);
    }
  };

  return { step, setStep, details, setDetails, confirm, orderRef, error };
}
