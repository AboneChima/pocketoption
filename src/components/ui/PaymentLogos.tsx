import React from 'react';
import Image from 'next/image';

// Official SVG Payment Logos Component
interface LogoProps {
  className?: string;
}

const createLogoComponent = (src: string, alt: string) => {
  return ({ className = "h-10 w-auto opacity-85" }: LogoProps) => (
    <Image
      src={src}
      alt={alt}
      width={120}
      height={60}
      className={className}
      style={{ 
        objectFit: 'contain'
      }}
    />
  );
};

// Export all payment logos using official SVG files
export const PaymentLogos = {
  Visa: createLogoComponent('/logos/visa.svg', 'Visa'),
  Mastercard: createLogoComponent('/logos/mastercard.svg', 'Mastercard'),
  PayPal: createLogoComponent('/logos/paypal.svg', 'PayPal'),
  Bitcoin: createLogoComponent('/logos/bitcoin.svg', 'Bitcoin'),
  Skrill: createLogoComponent('/logos/skrill.svg', 'Skrill'),
  Pix: createLogoComponent('/logos/pix.svg', 'PIX'),
  EasyPaisa: createLogoComponent('/logos/easypaisa.svg', 'EasyPaisa'),
  UPI: createLogoComponent('/logos/upi.svg', 'UPI'),
  Mpesa: createLogoComponent('/logos/mpesa.svg', 'M-Pesa'),
  Bkash: createLogoComponent('/logos/bkash.svg', 'bKash'),
  MercadoPago: createLogoComponent('/logos/mercadopago.svg', 'MercadoPago'),
};

export default PaymentLogos;