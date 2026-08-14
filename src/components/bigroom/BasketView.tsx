"use client";

import Link from "next/link";
import { useCart } from "@/components/store/CartContext";
import { useCheckout } from "@/components/store/CheckoutFlow";
import { formatGbp, getProduct, MAX_QTY } from "@/components/store/cartMath";

export default function BasketView() {
  const cart = useCart();
  const checkout = useCheckout();

  if (checkout.step === "confirmed") {
    return (
      <div className="glass-panel mx-auto max-w-2xl rounded-2xl p-10 text-center md:p-14">
        <p className="font-(family-name:--font-inter) text-xs uppercase tracking-[0.4em] text-br-gold">
          Order Complete
        </p>
        <h1 className="mt-3 font-(family-name:--font-display) text-3xl text-br-platinum md:text-4xl">
          Thank You
        </h1>
        <p className="mt-6 font-(family-name:--font-inter) text-base leading-relaxed text-br-platinum/90">
          Order {checkout.orderRef} confirmed. A receipt is on its way.
        </p>
        <p className="mt-4 font-(family-name:--font-inter) text-xs text-br-chrome/60">
          Demo checkout. No payment was taken and no email was sent.
        </p>
        <Link
          href="/store"
          className="light-sweep mt-10 inline-block rounded-full bg-br-teal px-8 py-3.5 font-(family-name:--font-inter) text-sm font-semibold text-br-platinum"
        >
          Back to the Store
        </Link>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="glass-panel mx-auto max-w-2xl rounded-2xl p-10 text-center md:p-14">
        <h1 className="font-(family-name:--font-display) text-3xl text-br-platinum md:text-4xl">
          Your Cart
        </h1>
        <p className="mt-6 font-(family-name:--font-inter) text-sm text-br-chrome">
          Your cart is empty.
        </p>
        <Link
          href="/store"
          className="light-sweep mt-8 inline-block rounded-full bg-br-teal px-8 py-3.5 font-(family-name:--font-inter) text-sm font-semibold text-br-platinum"
        >
          Browse the Store
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <p className="font-(family-name:--font-inter) text-xs uppercase tracking-[0.4em] text-br-gold">
        Checkout
      </p>
      <h1 className="mt-3 font-(family-name:--font-display) text-3xl text-br-platinum md:text-5xl">
        Your Cart
      </h1>

      <div className="mt-10 space-y-3">
        {cart.items.map((item) => {
          const product = getProduct(item.productId);
          if (!product) {
            return null;
          }
          return (
            <div
              key={item.productId}
              className="glass-panel flex flex-col gap-4 rounded-xl px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-(family-name:--font-display) text-base text-br-platinum">
                  {product.title}
                </p>
                <p className="mt-1 font-(family-name:--font-inter) text-xs text-br-chrome">
                  {product.detail}
                  {product.format ? ` / ${product.format}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-4 sm:gap-5">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label={`Decrease quantity of ${product.title}`}
                    onClick={() => cart.setQty(item.productId, item.qty - 1)}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-br-chrome/40 font-(family-name:--font-inter) text-sm text-br-platinum transition-colors hover:border-br-teal hover:text-br-teal sm:h-9 sm:w-9"
                  >
                    -
                  </button>
                  <span className="w-6 text-center font-(family-name:--font-inter) text-sm text-br-platinum">
                    {item.qty}
                  </span>
                  <button
                    type="button"
                    aria-label={`Increase quantity of ${product.title}`}
                    disabled={item.qty >= MAX_QTY}
                    onClick={() => cart.setQty(item.productId, item.qty + 1)}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-br-chrome/40 font-(family-name:--font-inter) text-sm text-br-platinum transition-colors hover:border-br-teal hover:text-br-teal disabled:cursor-not-allowed disabled:opacity-40 sm:h-9 sm:w-9"
                  >
                    +
                  </button>
                </div>
                <span className="ml-auto text-right font-(family-name:--font-inter) text-sm font-semibold text-br-platinum sm:ml-0 sm:w-20">
                  {formatGbp(product.priceGbp * item.qty)}
                </span>
                <button
                  type="button"
                  aria-label={`Remove ${product.title} from cart`}
                  onClick={() => cart.remove(item.productId)}
                  className="-mr-2 flex min-h-11 items-center px-2 font-(family-name:--font-inter) text-xs text-br-chrome transition-colors hover:text-br-teal sm:mr-0 sm:min-h-0 sm:px-0"
                >
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="gold-hairline mt-8 flex items-center justify-between pt-6">
        <span className="font-(family-name:--font-inter) text-sm uppercase tracking-[0.3em] text-br-chrome">
          Subtotal
        </span>
        <span className="font-(family-name:--font-display) text-2xl text-br-platinum">
          {formatGbp(cart.subtotal)}
        </span>
      </div>

      {checkout.step === "basket" ? (
        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={() => checkout.setStep("details")}
            className="light-sweep rounded-full bg-br-teal px-10 py-3.5 font-(family-name:--font-inter) text-sm font-semibold text-br-platinum"
          >
            Checkout
          </button>
        </div>
      ) : (
        <form
          className="glass-panel mt-8 rounded-2xl p-8 md:p-10"
          onSubmit={(event) => {
            event.preventDefault();
            checkout.confirm();
          }}
        >
          <h2 className="font-(family-name:--font-display) text-xl text-br-platinum">
            Your Details
          </h2>
          <div className="mt-6 flex flex-col gap-4 sm:flex-row">
            <input
              type="text"
              required
              value={checkout.details.name}
              onChange={(event) => {
                const value = event.target.value;
                checkout.setDetails((details) => ({ ...details, name: value }));
              }}
              placeholder="Full name"
              aria-label="Full name"
              autoComplete="name"
              /* 16px on mobile: anything smaller makes iOS Safari zoom on focus. */
              className="min-h-11 flex-1 rounded-full border border-br-chrome/30 bg-br-space/70 px-5 py-3 font-(family-name:--font-inter) text-base text-br-platinum placeholder:text-br-chrome/50 focus:border-br-teal focus:outline-none sm:text-sm"
            />
            <input
              type="email"
              required
              value={checkout.details.email}
              onChange={(event) => {
                const value = event.target.value;
                checkout.setDetails((details) => ({ ...details, email: value }));
              }}
              placeholder="your@email.com"
              aria-label="Email address"
              autoComplete="email"
              inputMode="email"
              className="min-h-11 flex-1 rounded-full border border-br-chrome/30 bg-br-space/70 px-5 py-3 font-(family-name:--font-inter) text-base text-br-platinum placeholder:text-br-chrome/50 focus:border-br-teal focus:outline-none sm:text-sm"
            />
          </div>
          {checkout.error ? (
            <p className="mt-4 font-(family-name:--font-inter) text-sm text-red-400">
              {checkout.error}
            </p>
          ) : null}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => checkout.setStep("basket")}
              className="-ml-2 flex min-h-11 items-center px-2 font-(family-name:--font-inter) text-sm text-br-chrome transition-colors hover:text-br-platinum sm:ml-0 sm:min-h-0 sm:px-0"
            >
              Back to Cart
            </button>
            <button
              type="submit"
              className="light-sweep rounded-full bg-br-teal px-10 py-3.5 font-(family-name:--font-inter) text-sm font-semibold text-br-platinum"
            >
              Confirm Order
            </button>
          </div>
          <p className="mt-6 font-(family-name:--font-inter) text-xs text-br-chrome/60">
            Demo checkout. No payment details are requested and nothing is
            charged.
          </p>
        </form>
      )}
    </div>
  );
}
