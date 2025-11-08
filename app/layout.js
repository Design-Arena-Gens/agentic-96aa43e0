export const metadata = {
  title: "Veo 3 ?????? ??????",
  description: "?? ????? ?????? ?? ? ??? ?? - ?????? ?????? ????",
};

export default function RootLayout({ children }) {
  return (
    <html lang="hi">
      <body style={{
        margin: 0,
        fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial, sans-serif',
        background: 'radial-gradient(1200px 600px at 70% -20%, #0b1a38 0%, #070f1f 40%, #040914 100%)',
        color: '#e6eefc'
      }}>
        {children}
      </body>
    </html>
  );
}
