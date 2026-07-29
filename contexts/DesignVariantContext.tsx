import React, { createContext, useContext, useState } from "react";

export type LoginVariant = "paper" | "retro";

interface DesignVariantContextType {
  variant: LoginVariant;
  setVariant: (variant: LoginVariant) => void;
  /** True for the one render right after a successful sign-in, so Home can play its reveal once. */
  justSignedIn: boolean;
  markJustSignedIn: () => void;
  clearJustSignedIn: () => void;
}

const DesignVariantContext = createContext<DesignVariantContextType | undefined>(
  undefined,
);

export function DesignVariantProvider({ children }: { children: React.ReactNode }) {
  const [variant, setVariant] = useState<LoginVariant>("paper");
  const [justSignedIn, setJustSignedIn] = useState(false);

  const value: DesignVariantContextType = {
    variant,
    setVariant,
    justSignedIn,
    markJustSignedIn: () => setJustSignedIn(true),
    clearJustSignedIn: () => setJustSignedIn(false),
  };

  return (
    <DesignVariantContext.Provider value={value}>
      {children}
    </DesignVariantContext.Provider>
  );
}

export function useDesignVariant() {
  const context = useContext(DesignVariantContext);
  if (context === undefined) {
    throw new Error("useDesignVariant must be used within a DesignVariantProvider");
  }
  return context;
}
