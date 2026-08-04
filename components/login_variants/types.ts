export interface LoginVariantProps {
  email: string;
  setEmail: (email: string) => void;
  isLoading: boolean;
  onRequestCode: (email: string) => Promise<void>;
}
