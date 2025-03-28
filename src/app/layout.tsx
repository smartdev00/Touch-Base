import { AuthProvider } from '@/lib/contexts/AuthContext';
import { FirebaseProvider } from '@/lib/contexts/FirebaseProvider';
import { GoogleAuthProvider } from '@/lib/contexts/GoogleAuthContext';
import { DeepgramContextProvider } from '@/lib/contexts/DeepgramContext';
import './globals.css';
import Footer from '@/components/layout/Footer';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <body suppressHydrationWarning={true}>
        <FirebaseProvider>
          <DeepgramContextProvider>
            <AuthProvider>
              <GoogleAuthProvider>
                <div className='relative flex flex-col items-center justify-center min-h-screen'>
                  {children}
                  <Footer />
                </div>
              </GoogleAuthProvider>
            </AuthProvider>
          </DeepgramContextProvider>
        </FirebaseProvider>
      </body>
    </html>
  );
}
