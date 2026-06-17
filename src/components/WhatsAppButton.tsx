import { MessageCircle } from "lucide-react";

type WhatsAppButtonProps = {
  productName?: string;
  className?: string;
};

export function WhatsAppButton({ productName, className = "" }: WhatsAppButtonProps) {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5521973636891";
  const message = encodeURIComponent(
    productName
      ? `Ola, gostaria de solicitar um orcamento para o produto ${productName}.`
      : "Ola, gostaria de solicitar um orcamento pelo catalogo Briland.",
  );

  return (
    <a
      href={`https://wa.me/${phone}?text=${message}`}
      target="_blank"
      rel="noreferrer"
      className={`inline-flex items-center justify-center gap-2 rounded-md bg-[#d9aa2b] px-4 py-3 text-sm font-black text-[#021126] shadow-sm transition hover:bg-[#c99a1f] ${className}`}
    >
      <MessageCircle className="h-4 w-4" aria-hidden />
      WhatsApp
    </a>
  );
}
