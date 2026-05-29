import "./globals.css";

export const metadata = {
  title: "Onboarding Agent",
  description: "AI-powered onboarding chatbot",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
