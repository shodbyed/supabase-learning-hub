// components
import { Navigation } from './navigation/Navigation';
import { ToastContainer } from 'react-toastify';
import { BrowserRouter as Router } from 'react-router-dom';

// context
import { ConfirmDialogProvider } from './context/ConfirmContext';
import { QueryClientProvider, QueryClient } from 'react-query';
import { SelectedItemProvider } from './context/SelectedItemProvider';

// firebase
import { FirebaseProvider } from 'bca-firebase-queries';
import { ReactQueryDevtools } from 'react-query/devtools';
import { AuthProvider } from './context/AuthContext';

// css
import 'react-toastify/dist/ReactToastify.css';

const queryClient = new QueryClient();

const firebaseCredentials = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <FirebaseProvider credentials={firebaseCredentials}>
        <AuthProvider>
          <SelectedItemProvider>
            <ConfirmDialogProvider>
              <Router>
                <Navigation />
              </Router>
              <ToastContainer
                position="top-left"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                draggable
                pauseOnHover
                theme="colored"
              />
            </ConfirmDialogProvider>
          </SelectedItemProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </AuthProvider>
      </FirebaseProvider>
    </QueryClientProvider>
  );
}

export default App;
